<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Cart, CartItem, Producto};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    protected function getOrCreateCart($user)
    {
        return Cart::firstOrCreate(
            ['user_id' => $user->id, 'status' => 'active'],
            ['currency' => 'EUR', 'subtotal' => 0, 'total' => 0],
        )->load('items.producto');
    }

    public function show(Request $req)
    {
        $cart = $this->getOrCreateCart($req->user());

        return response()->json([
            'id'       => $cart->id,
            'user_id'  => $cart->user_id,
            'currency' => $cart->currency,
            'subtotal' => (float) $cart->subtotal,
            'total'    => (float) $cart->total,
            'items'    => $cart->items->map(fn($it) => [
                'id'           => $it->id,
                'producto_id'  => $it->producto_id, // id_producto en productos
                'nombre'       => $it->name_snapshot ?? optional($it->producto)->nombre,
                'precio_base'  => (float) $it->unit_price,
                'imagen'       => $it->image_snapshot ?? optional($it->producto)->imagen,
                'cantidad'     => (int) $it->quantity,
            ]),
        ]);
    }

    public function add(Request $req)
    {
        $data = $req->validate([
            'producto_id' => ['required', 'integer', 'exists:productos,id_producto'],
            'quantity' => ['nullable', 'integer', 'min:1'],
        ]);
        $qty = max(1, (int)($data['quantity'] ?? 1));

        return DB::transaction(function () use ($req, $data, $qty) {
            $cart = $this->getOrCreateCart($req->user());

            // Buscar por id_producto (tu PK)
            $prod = Producto::where('id_producto', $data['producto_id'])->firstOrFail();

            $item = CartItem::firstOrNew([
                'cart_id' => $cart->id,
                'producto_id' => $prod->id_producto, //  importante
            ]);

            if (!$item->exists) {
                $item->unit_price    = $prod->precio_base; // snapshot
                $item->name_snapshot = $prod->nombre;
                $item->image_snapshot = $prod->imagen;
                $item->quantity = 0;
            }

            $item->quantity += $qty;
            $item->save();

            $cart->load('items');
            $cart->recalcTotals();

            return $this->show($req);
        });
    }

    public function updateQty(Request $req)
    {
        $data = $req->validate([
            'producto_id' => ['required', 'integer', 'exists:productos,id_producto'], // 
            'quantity'    => ['required', 'integer', 'min:0'],
        ]);

        return DB::transaction(function () use ($req, $data) {
            $cart = $this->getOrCreateCart($req->user());

            $item = CartItem::where('cart_id', $cart->id)
                ->where('producto_id', $data['producto_id']) //  mismo valor que id_producto
                ->first();

            if (!$item) return $this->show($req);

            if ($data['quantity'] <= 0) {
                $item->delete();
            } else {
                $item->quantity = $data['quantity'];
                $item->save();
            }

            $cart->load('items');
            $cart->recalcTotals();

            return $this->show($req);
        });
    }

    public function remove(Request $req)
    {
        $data = $req->validate([
            'producto_id' => ['required', 'integer', 'exists:productos,id_producto'], 
        ]);

        return DB::transaction(function () use ($req, $data) {
            $cart = $this->getOrCreateCart($req->user());

            CartItem::where('cart_id', $cart->id)
                ->where('producto_id', $data['producto_id']) 
                ->delete();

            $cart->load('items');
            $cart->recalcTotals();

            return $this->show($req);
        });
    }

    public function clear(Request $req)
    {
        return DB::transaction(function () use ($req) {
            $cart = $this->getOrCreateCart($req->user());
            CartItem::where('cart_id', $cart->id)->delete();
            $cart->load('items');
            $cart->recalcTotals();
            return $this->show($req);
        });
    }

    // Sube carrito local (guest o cliente) y fusiona con servidor
    public function sync(Request $req)
    {
        $payload = $req->validate([
            'items'                 => ['array'],
            'items.*.producto_id'   => ['required', 'integer', 'exists:productos,id_producto'], 
            'items.*.cantidad'      => ['required', 'integer', 'min:1'],
        ]);

        return DB::transaction(function () use ($req, $payload) {
            $cart = $this->getOrCreateCart($req->user());

            // mapa actual por producto_id (id_producto en productos)
            $current = $cart->items()->get()->keyBy('producto_id');

            foreach ($payload['items'] ?? [] as $it) {
                $prod = Producto::where('id_producto', $it['producto_id'])->firstOrFail(); 
                $existing = $current->get($prod->id_producto);

                if ($existing) {
                    $existing->quantity += (int) $it['cantidad'];
                    $existing->save();
                } else {
                    $cart->items()->create([
                        'producto_id'    => $prod->id_producto,   //  guarda id_producto
                        'quantity'       => (int) $it['cantidad'],
                        'unit_price'     => $prod->precio_base,
                        'name_snapshot'  => $prod->nombre,
                        'image_snapshot' => $prod->imagen,
                    ]);
                }
            }

            $cart->load('items');
            $cart->recalcTotals();

            return $this->show($req);
        });
    }
}
