<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\{Cart, CartItem, Producto, Order, OrderItem};

class StripeController extends Controller
{
    /**
     * Cliente de Stripe usando la secret de config/services o .env
     */
    private function stripe(): \Stripe\StripeClient
    {
        return new \Stripe\StripeClient([
            'api_key' => trim(config('services.stripe.secret') ?? env('STRIPE_SECRET', '')),
        ]);
    }

    /**
     * Obtiene o crea el carrito activo del usuario y lo carga con items+producto
     */
    private function getActiveCart($user): Cart
    {
        return Cart::firstOrCreate(
            ['user_id' => $user->id, 'status' => 'active'],
            ['currency' => env('STRIPE_CURRENCY', 'EUR'), 'subtotal' => 0, 'total' => 0]
        )->load('items.producto');
    }

    /**
     * Crea una sesión de Checkout a partir del carrito del usuario autenticado
     * POST /api/checkout/sessions  (auth:sanctum)
     */
    public function createCheckoutSession(Request $request)
    {
        $user = $request->user();
        $cart = $this->getActiveCart($user);

        if ($cart->items->isEmpty()) {
            return response()->json(['message' => 'El carrito está vacío'], 422);
        }

        // ✅ 1) Verificación de stock previa
        foreach ($cart->items as $it) {
            $p = $it->producto;
            if (!$p || ($p->stock ?? 0) <= 0) {
                $productName = $it->name_snapshot ?? $p?->nombre ?? 'Producto';
                return response()->json(['message' => "Producto sin stock: '{$productName}'"], 422);
            }
            if ($it->quantity > $p->stock) {
                $productName = $it->name_snapshot ?? $p->nombre;
                return response()->json(['message' => "Stock insuficiente en '{$productName}'. Disponible: {$p->stock}"], 422);
            }
        }

        $currency = strtolower($cart->currency ?: env('STRIPE_CURRENCY', 'EUR'));

        $lineItems = $cart->items->map(function (CartItem $item) use ($currency) {
            $name  = $item->name_snapshot ?? optional($item->producto)->nombre ?? 'Producto';
            $price = (int) round(($item->unit_price ?? 0) * 100);
            $img   = $item->image_snapshot ?: optional($item->producto)->imagen;

            $imageUrl = null;
            if ($img) {
                if (str_starts_with($img, 'http')) {
                    $imageUrl = $img;
                } else {
                    $base = rtrim(config('app.url') ?? env('APP_URL', ''), '/');
                    if ($base) $imageUrl = $base . '/storage/' . ltrim($img, '/');
                }
            }

            $productData = ['name' => $name];
            if ($imageUrl) $productData['images'] = [$imageUrl];

            return [
                'price_data' => [
                    'currency'     => $currency,
                    'product_data' => $productData,
                    'unit_amount'  => $price,
                ],
                'quantity' => max(1, (int) $item->quantity),
            ];
        })->values()->all();

        $successUrl = rtrim(env('FRONTEND_URL'), '/') . '/checkout/success?session_id={CHECKOUT_SESSION_ID}';
        $cancelUrl  = rtrim(env('FRONTEND_URL'), '/') . '/checkout/cancel';

        $session = $this->stripe()->checkout->sessions->create([
            'mode' => 'payment',
            'line_items' => $lineItems,
            'success_url' => $successUrl,
            'cancel_url'  => $cancelUrl,
            'customer_email' => $user->email,
            'shipping_address_collection' => [
                'allowed_countries' => ['ES', 'PT', 'FR']
            ],
            'phone_number_collection' => ['enabled' => true],
            'metadata' => [
                'cart_id' => (string) $cart->id,
                'user_id' => (string) $user->id,
            ],
        ]);

        return response()->json(['id' => $session->id, 'url' => $session->url]);
    }

    /**
     * Webhook de Stripe: procesa checkout.session.completed
     * URL pública: POST {APP_URL}/api/stripe/webhook
     */
    public function webhook()
    {
        $request   = request();
        $payload   = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret    = trim(config('services.stripe.webhook_secret') ?? env('STRIPE_WEBHOOK_SECRET', ''));

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (\Throwable $e) {
            Log::warning('[stripe] webhook signature error: ' . $e->getMessage());
            return response('Invalid signature', 400);
        }

        if ($event->type !== 'checkout.session.completed') {
            return response('ok', 200);
        }

        /** @var \Stripe\Checkout\Session|null $session */
        $session = $event->data->object instanceof \Stripe\Checkout\Session
            ? $event->data->object : null;

        if (!$session) {
            Log::warning('[stripe] event data is not a Checkout.Session');
            return response('ok', 200);
        }

        $sessionId = (string)($session->id ?? '');
        $userId    = (string)($session->metadata->user_id ?? '');
        $cartId    = (string)($session->metadata->cart_id ?? '');
        $piId      = is_string($session->payment_intent ?? null) ? $session->payment_intent : null;

        $amountTot = is_numeric($session->amount_total ?? null)
            ? ((int)$session->amount_total) / 100 : 0.0;

        if ($sessionId && Order::where('stripe_session_id', $sessionId)->exists()) {
            return response('OK', 200);
        }

        try {
            // Pasamos $session al closure 👇
            DB::transaction(function () use ($session, $cartId, $userId, $sessionId, $piId, $amountTot) {
                $cart = $cartId ? Cart::with('items.producto')->find($cartId) : null;

                $customerDetails = [
                    'name'  => $session->customer_details->name  ?? null,
                    'email' => $session->customer_details->email ?? null,
                    'phone' => $session->customer_details->phone ?? null,
                    'address' => [
                        'line1'       => $session->customer_details->address->line1 ?? null,
                        'line2'       => $session->customer_details->address->line2 ?? null,
                        'city'        => $session->customer_details->address->city ?? null,
                        'postal_code' => $session->customer_details->address->postal_code ?? null,
                        'country'     => $session->customer_details->address->country ?? null,
                    ],
                ];

                $shippingDetails = [
                    'name'  => $session->shipping_details->name  ?? null,
                    'phone' => $session->shipping_details->phone ?? null,
                    'address' => [
                        'line1'       => $session->shipping_details->address->line1 ?? null,
                        'line2'       => $session->shipping_details->address->line2 ?? null,
                        'city'        => $session->shipping_details->address->city ?? null,
                        'postal_code' => $session->shipping_details->address->postal_code ?? null,
                        'country'     => $session->shipping_details->address->country ?? null,
                    ],
                ];

                $orderAmount = $amountTot > 0 ? $amountTot : (float)($cart?->total ?? 0);

                $order = Order::create([
                    'user_id'                   => $cart?->user_id ?: ($userId ?: null),
                    'stripe_session_id'         => $sessionId,
                    'stripe_payment_intent_id'  => $piId,
                    'status'                    => 'paid',
                    'currency'                  => $cart?->currency ?? env('STRIPE_CURRENCY', 'EUR'),
                    'amount'                    => $orderAmount,
                    'billing_snapshot'          => ['customer' => $customerDetails, 'shipping' => $shippingDetails],
                    'metadata'                  => null,
                ]);

                if ($cart && $cart->items->isNotEmpty()) {
                    foreach ($cart->items as $it) {
                        $unit = (float)$it->unit_price;
                        $qty  = (int)$it->quantity;

                        OrderItem::create([
                            'order_id'    => $order->id,
                            'producto_id' => (int)$it->producto_id,
                            'name'        => $it->name_snapshot ?? ($it->producto->nombre ?? 'Producto'),
                            'image'       => $it->image_snapshot ?? ($it->producto->imagen ?? null),
                            'unit_price'  => $unit,
                            'quantity'    => $qty,
                            'line_total'  => $unit * $qty,
                        ]);

                        // Clamp de stock (nunca negativo)
                        if ($p = Producto::where('id_producto', $it->producto_id)->lockForUpdate()->first()) {
                            $nuevo = max(0, (int)$p->stock - (int)$qty);
                            $p->update(['stock' => $nuevo]);
                        }
                    }

                    // Estado permitido por tu CHECK en carts (no 'paid')
                    $cart->status = 'ordered';
                    $cart->save();
                    CartItem::where('cart_id', $cart->id)->delete();
                } else {
                    // Fallback: leer line items de Stripe
                    $s = $this->stripe()->checkout->sessions->retrieve($sessionId, [
                        'expand' => ['line_items.data.price.product']
                    ]);
                    if (!empty($s->line_items?->data)) {
                        foreach ($s->line_items->data as $li) {
                            $qty  = (int)($li->quantity ?? 1);
                            $name = $li->description ?? ($li->price->product->name ?? 'Producto');
                            $img  = $li->price->product->images[0] ?? null;

                            $unit = 0;
                            if (isset($li->amount_subtotal) && $qty > 0) {
                                $unit = ($li->amount_subtotal / 100) / $qty;
                            } elseif (isset($li->price->unit_amount)) {
                                $unit = ($li->price->unit_amount / 100);
                            }

                            OrderItem::create([
                                'order_id'    => $order->id,
                                'producto_id' => 0,
                                'name'        => $name,
                                'image'       => $img,
                                'unit_price'  => $unit,
                                'quantity'    => $qty,
                                'line_total'  => $unit * $qty,
                            ]);
                        }
                    }
                }
            });
        } catch (\Throwable $e) {
            Log::error('[stripe] webhook completed error', [
                'msg'  => $e->getMessage(),
                'file' => $e->getFile() . ':' . $e->getLine(),
            ]);
            return response('ERR', 500);
        }

        return new Response('ok', 200);
    }
}
