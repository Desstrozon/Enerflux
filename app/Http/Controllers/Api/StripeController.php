<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Mail;               // [NEW]
use App\Mail\OrderPaidMail;                        // [NEW]
use App\Notifications\OrderPaidNotification;       // [NEW]


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
     * Normaliza un teléfono a formato E.164 (por defecto ES).
     */
    private function normPhoneE164(?string $raw, string $country = 'ES'): ?string
    {
        if (!$raw) return null;
        $digits = preg_replace('/\D+/', '', $raw);

        // Si ya viene con + y suficientes dígitos, lo damos por válido
        if (str_starts_with($raw, '+') && strlen($digits) >= 8) {
            return '+' . $digits;
        }

        // España: 9 dígitos típicos
        if ($country === 'ES' && strlen($digits) === 9) {
            return '+34' . $digits;
        }

        // Si no podemos garantizar E.164, mejor no enviar
        return null;
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
    public function createCheckoutSession()
    {
        $user = request()->user();
        $cart = $this->getActiveCart($user);

        if ($cart->items->isEmpty()) {
            return response()->json(['message' => 'El carrito está vacío'], 422);
        }

        //  Verificación de stock previa (tal y como ya manejabas)
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

        // Construir line_items para Stripe
        $lineItems = $cart->items->map(function (CartItem $item) use ($currency) {
            $name  = $item->name_snapshot ?? optional($item->producto)->nombre ?? 'Producto';
            $price = (int) round(($item->unit_price ?? 0) * 100); // céntimos
            $img   = $item->image_snapshot ?: optional($item->producto)->imagen;

            // URL pública de imagen 
            $imageUrl = null;
            if ($img) {
                if (str_starts_with($img, 'http')) {
                    $imageUrl = $img;
                } else {
                    $base = rtrim(config('app.url') ?? env('APP_URL', ''), '/');
                    if ($base) {
                        $imageUrl = $base . '/storage/' . ltrim($img, '/');
                    }
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


        $baseUrl = rtrim(env('FRONTEND_URL', request()->getSchemeAndHttpHost()), '/');
        $isAzure = str_contains($baseUrl, 'azurewebsites.net');

        if ($isAzure) {
            // Producción en Azure
            $successUrl = $baseUrl . '/frontend/checkout/success?session_id={CHECKOUT_SESSION_ID}';
            $cancelUrl  = $baseUrl . '/frontend/checkout/cancel';
        } else {
            // Local
            $localFrontend = rtrim(env('FRONTEND_URL', 'http://localhost:8080'), '/');
            $successUrl    = $localFrontend . '/checkout/success?session_id={CHECKOUT_SESSION_ID}';
            $cancelUrl     = $localFrontend . '/checkout/cancel';
        }


        // =========================
        //  Customer + dirección
        // =========================
        $sc = $this->stripe();

        // Aseguramos tener el perfil cargado (dirección/telefono guardados en tu app)
        $user->loadMissing('perfilCliente');
        $perfil   = $user->perfilCliente;
        $country  = $perfil->country ?: 'ES';
        $phoneE164 = $this->normPhoneE164($perfil->telefono ?? null, $country);

        $address = [
            'line1'       => $perfil->address_line1 ?: ($perfil->direccion ?: null),
            'line2'       => $perfil->address_line2,
            'city'        => $perfil->city,
            'postal_code' => $perfil->postal_code,
            'country'     => $country,
        ];

        $customerPayload = [
            'email'   => $user->email,
            'name'    => $user->name ?: null,
            'phone'   => $phoneE164,
            'address' => $address, // facturación
            'shipping' => [
                'name'    => $user->name ?: null,
                'phone'   => $phoneE164,
                'address' => $address, // envío
            ],
        ];

        // Creamos/actualizamos Customer y SIEMPRE usamos 'customer' (no customer_email)
        $customerId = $user->stripe_customer_id ?? null;
        if ($customerId) {
            $sc->customers->update($customerId, $customerPayload);
        } else {
            $created = $sc->customers->create($customerPayload);
            $customerId = $created->id;
            // guardamos el id de customer en el usuario
            $user->stripe_customer_id = $customerId;
            $user->save();
        }

        // =========================
        //  Parámetros de la sesión
        // =========================
        $params = [
            'mode'        => 'payment',
            'line_items'  => $lineItems,
            'success_url' => $successUrl,
            'cancel_url'  => $cancelUrl,
            'customer'    => $customerId, //  evitamos customer_email
            'customer_update' => [
                'name'     => 'auto',
                'address'  => 'auto',
                'shipping' => 'auto',
                //  'phone' no es válido aquí; lo quitamos
            ],
            'shipping_address_collection' => [
                'allowed_countries' => ['ES', 'PT', 'FR'],
            ],
            'phone_number_collection' => ['enabled' => true],
            'metadata' => [
                'cart_id' => (string) $cart->id,
                'user_id' => (string) $user->id,
            ],
        ];

        $session = $sc->checkout->sessions->create($params);
        // ========= NUEVO: crear pedido "pending" =========
        $orderAmount = (float) ($cart->total ?? 0);

        Order::create([
            'user_id'           => $user->id,
            'stripe_session_id' => $session->id,
            'stripe_payment_intent_id' => null,
            'status'            => 'pending', // se pondrá "paid" en el webhook
            'currency'          => $cart->currency ?? env('STRIPE_CURRENCY', 'EUR'),
            'amount'            => $orderAmount,
            'billing_snapshot'  => null,
            'metadata'          => null,
        ]);
        // =================================================

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

        try {
            // Necesitamos el id del pedido fuera de la transacción para enviar el email luego
            $orderId = null;

            DB::transaction(function () use ($session, $cartId, $userId, $sessionId, $piId, $amountTot, &$orderId) {
                // Buscar pedido existente (creado en createCheckoutSession)
                $order = Order::where('stripe_session_id', $sessionId)->first();

                $cart = $cartId ? Cart::with('items.producto')->find($cartId) : null;

                $customer = $session->customer_details ?? null;
                $shipping = $session->shipping_details ?? null;

                $customerAddress = $customer?->address;
                $shippingAddress = $shipping?->address;

                $customerDetails = [
                    'name'  => $customer->name ?? null,
                    'email' => $customer->email ?? null,
                    'phone' => $customer->phone ?? null,
                    'address' => [
                        'line1'       => $customerAddress->line1 ?? null,
                        'line2'       => $customerAddress->line2 ?? null,
                        'city'        => $customerAddress->city ?? null,
                        'postal_code' => $customerAddress->postal_code ?? null,
                        'country'     => $customerAddress->country ?? null,
                    ],
                ];

                $shippingDetails = [
                    'name'  => $shipping->name ?? null,
                    'phone' => $shipping->phone ?? null,
                    'address' => [
                        'line1'       => $shippingAddress->line1 ?? null,
                        'line2'       => $shippingAddress->line2 ?? null,
                        'city'        => $shippingAddress->city ?? null,
                        'postal_code' => $shippingAddress->postal_code ?? null,
                        'country'     => $shippingAddress->country ?? null,
                    ],
                ];

                $orderAmount = $amountTot > 0 ? $amountTot : (float)($cart?->total ?? 0);
                $currency    = $cart?->currency ?? env('STRIPE_CURRENCY', 'EUR');
                $userIdFinal = $cart?->user_id ?: ($userId ?: null);

                if ($order) {
                    // ✅ Ya existía: lo actualizamos
                    $order->update([
                        'user_id'                  => $userIdFinal,
                        'stripe_payment_intent_id' => $piId,
                        'status'                   => 'paid',
                        'currency'                 => $currency,
                        'amount'                   => $orderAmount,
                        'billing_snapshot'         => ['customer' => $customerDetails, 'shipping' => $shippingDetails],
                    ]);
                } else {
                    // Fallback: no existía, lo creamos como antes
                    $order = Order::create([
                        'user_id'                  => $userIdFinal,
                        'stripe_session_id'        => $sessionId,
                        'stripe_payment_intent_id' => $piId,
                        'status'                   => 'paid',
                        'currency'                 => $currency,
                        'amount'                   => $orderAmount,
                        'billing_snapshot'         => ['customer' => $customerDetails, 'shipping' => $shippingDetails],
                        'metadata'                 => null,
                    ]);
                }

                $orderId = $order->id;

                // ====== LÍNEAS E INVENTARIO (igual que antes) ======
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

                        if ($p = Producto::where('id_producto', $it->producto_id)->lockForUpdate()->first()) {
                            $nuevo = max(0, (int)$p->stock - (int)$qty);
                            $p->update(['stock' => $nuevo]);
                        }
                    }

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

            // ============================
            // Email + Notificación (igual)
            // ============================
            try {
                if ($orderId) {
                    $order = Order::findOrFail($orderId)->load('user');

                    if ($order?->user) {
                        $invoices = app(\App\Services\InvoiceService::class);
                        $pdfBytes = $invoices->renderPdf($order);

                        Mail::to($order->user->email)->send(new OrderPaidMail($order, $pdfBytes));
                        $order->user->notify(new OrderPaidNotification($order));
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('[order_paid side-effects] ' . $e->getMessage());
            }
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
