<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Producto;
use App\Models\CartItem;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ProductoController extends Controller
{
    use AuthorizesRequests;

    // GET /api/productos
     public function index(Request $request)
    {
        $q = trim($request->query('q', ''));

        $productos = Producto::query()
            ->when($q !== '', function ($query) use ($q) {
                $like = "%{$q}%";
                $query->where(function ($w) use ($like) {
                    $w->where('nombre', 'like', $like)
                      ->orWhere('categoria', 'like', $like)
                      ->orWhere('descripcion', 'like', $like);
                });
            })
            // 👇 usa la relación productReviews (NO reviews)
            ->withCount(['productReviews as reviews_count'])
            ->withAvg('productReviews as avg_rating', 'rating')
            ->orderBy('id_producto', 'desc')
            ->get();

        return response()->json($productos);
    }

    public function show($id)
    {
        $producto = Producto::where('id_producto', $id)
            ->withCount(['productReviews as reviews_count'])
            ->withAvg('productReviews as avg_rating', 'rating')
            ->firstOrFail();

        return response()->json($producto);
    }

    // POST /api/productos
    public function store(Request $request)
    {
        $this->authorize('create', Producto::class);

        $validated = $request->validate([
            'nombre'       => 'required|string|max:150|unique:productos,nombre',
            'descripcion'  => 'nullable|string',
            'categoria'    => 'required|string|max:20',
            'precio_base'  => 'required|numeric|min:0',
            'stock'        => 'required|integer|min:0',
            'id_vendedor'  => 'nullable|integer|exists:users,id',
            'imagen'       => 'nullable|image|max:2048',
        ]);

        // Si el creador es vendor, fuerza su id
        if (strtolower($request->user()->rol ?? '') === 'vendedor') {
            $validated['id_vendedor'] = $request->user()->id;
        }

        if ($request->hasFile('imagen')) {
            $validated['imagen'] = $request->file('imagen')->store('productos', 'public');
        } else {
            // debe existir storage/app/public/productos/default.png
            $validated['imagen'] = 'productos/default.png';
        }

        $producto = Producto::create($validated);

        return response()->json($producto, 201);
    }

    // PUT /api/productos/{producto}
    public function update(Request $request, Producto $producto)
    {
        $this->authorize('update', $producto);

        $data = $request->validate([
            'nombre'       => 'sometimes|string|max:150|unique:productos,nombre,' . $producto->getKey() . ',id_producto',
            'descripcion'  => 'nullable|string',
            'categoria'    => 'sometimes|string|max:20',
            'precio_base'  => 'sometimes|numeric|min:0',
            'stock'        => 'sometimes|integer|min:0',
            'id_vendedor'  => 'nullable|integer|exists:users,id',
            'imagen'       => 'nullable|image|max:2048',
        ]);

        // vendor no reasigna vendedor
        if (array_key_exists('id_vendedor', $data) && strtolower($request->user()->rol ?? '') === 'vendedor') {
            unset($data['id_vendedor']);
        }

        if ($request->hasFile('imagen')) {
            if (
                $producto->imagen
                && $producto->imagen !== 'productos/default.png'
                && Storage::disk('public')->exists($producto->imagen)
            ) {
                Storage::disk('public')->delete($producto->imagen);
            }
            $data['imagen'] = $request->file('imagen')->store('productos', 'public');
        }

        $producto->update($data);

        return response()->json($producto);
    }

    // DELETE /api/productos/{producto}
    public function destroy(Producto $producto)
    {
        $this->authorize('delete', $producto);

        DB::transaction(function () use ($producto) {
            // evitar fallo de FK en SQLite (cart_items → productos)
            CartItem::where('producto_id', $producto->id_producto)->delete();

            if (
                $producto->imagen
                && $producto->imagen !== 'productos/default.png'
                && Storage::disk('public')->exists($producto->imagen)
            ) {
                Storage::disk('public')->delete($producto->imagen);
            }

            $producto->delete();
        });

        return response()->noContent();
    }
}
