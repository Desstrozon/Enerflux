<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Producto;
use App\Models\CartItem;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
//  AÑADIR ESTOS IMPORTS
use App\Models\Panel;
use App\Models\Bateria;
use App\Models\Inversor;

class ProductoController extends Controller
{
    use AuthorizesRequests;

    //       public function show($id)
    // {
    //     $producto = Producto::query()
    //         ->leftJoin('users as v', 'v.id', '=', 'productos.id_vendedor')              //  JOIN vendedor
    //         ->where('productos.id_producto', $id)
    //         ->withCount(['productReviews as reviews_count'])
    //         ->withAvg('productReviews as avg_rating', 'rating')
    //         ->select('productos.*', DB::raw('v.name as vendedor_nombre'))               //  campo extra
    //         ->firstOrFail();

    //     // (si además añades panel/batería aquí, deja tu lógica como la tengas)
    //     return response()->json($producto);
    // }
    // // GET /api/productos
    // public function index(Request $request)
    // {
    //     $q = trim($request->query('q', ''));

    //     $productos = Producto::query()
    //         ->leftJoin('users as v', 'v.id', '=', 'productos.id_vendedor')              //  JOIN vendedor
    //         ->when($q !== '', function ($query) use ($q) {
    //             $like = "%{$q}%";
    //             $query->where(function ($w) use ($like) {
    //                 $w->where('productos.nombre', 'like', $like)                        //  prefijo tabla
    //                     ->orWhere('productos.categoria', 'like', $like)
    //                     ->orWhere('productos.descripcion', 'like', $like);
    //             });
    //         })
    //         ->withCount(['productReviews as reviews_count'])
    //         ->withAvg('productReviews as avg_rating', 'rating')
    //         ->select('productos.*', DB::raw('v.name as vendedor_nombre'))               //  campo extra
    //         ->orderBy('productos.id_producto', 'desc')
    //         ->get();

    //     return response()->json($productos);
    // }
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
            //  usa la relación productReviews (NO reviews)
            ->withCount(['productReviews as reviews_count'])
            ->withAvg('productReviews as avg_rating', 'rating')
            
            //  CARGAR SIEMPRE CARACTERÍSTICAS
            ->with(['panel', 'bateria', 'inversor'])
            ->orderBy('id_producto', 'desc')
            ->get();

        return response()->json($productos);
    }

    // ===== util privado =====
    private function galleryDir($productoId)
    {
        return "productos_gallery/{$productoId}";
    }

    private function listGallery($productoId)
    {
        $dir = $this->galleryDir($productoId);
        $files = Storage::disk('public')->exists($dir) ? Storage::disk('public')->files($dir) : [];
        // devolver rutas relativas tipo productos_gallery/ID/archivo.jpg
        return array_values($files);
    }


    public function show($id)
    {
        $producto = Producto::where('id_producto', $id)
            ->withCount(['productReviews as reviews_count'])
            ->withAvg('productReviews as avg_rating', 'rating')
            //  CARGAR SIEMPRE CARACTERÍSTICAS
            ->with(['panel', 'bateria', 'inversor'])
            ->firstOrFail();

        $producto->galeria = $this->listGallery($producto->id_producto);
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

            //  Opcionales por categoría (NO obligatorios para no romper)
            'modelo_panel'   => 'nullable|string|max:100',
            'eficiencia'     => 'nullable|numeric',
            'superficie'     => 'nullable|numeric',
            'produccion'     => 'nullable|numeric',
            'modelo_bateria' => 'nullable|string|max:100',
            'capacidad'      => 'nullable|numeric',
            'autonomia'      => 'nullable|numeric',
        ]);

        // Si el creador es vendor, fuerza su id
        if (strtolower($request->user()->rol ?? '') === 'vendedor') {
            $validated['id_vendedor'] = $request->user()->id;
        }

        if ($request->hasFile('imagen')) {
            $validated['imagen'] = $request->file('imagen')->store('productos', 'public');
        } else {
            $validated['imagen'] = 'productos/default.png';
        }

        $producto = Producto::create($validated);
        // GALERÍA (crear)
        if ($request->hasFile('galeria')) {
            foreach ($request->file('galeria') as $file) {
                if ($file->isValid()) {
                    $path = $file->store($this->galleryDir($producto->id_producto), 'public');
                }
            }
        }

        // === Características específicas por categoría (crear) ===
        if ($producto->categoria === 'panel') {
            $panelData = $request->only(['modelo_panel', 'eficiencia', 'superficie', 'produccion']);
            if (!empty($panelData['modelo_panel']) || isset($panelData['eficiencia']) || isset($panelData['superficie']) || isset($panelData['produccion'])) {
                Panel::create([
                    'id_producto' => $producto->id_producto,
                    'modelo'      => $panelData['modelo_panel'] ?? null,
                    'eficiencia'  => $panelData['eficiencia'] ?? 0,
                    'superficie'  => $panelData['superficie'] ?? 0,
                    'produccion'  => $panelData['produccion'] ?? 0,
                ]);
            }
        } elseif ($producto->categoria === 'bateria') {
            $batData = $request->only(['modelo_bateria', 'capacidad', 'autonomia']);
            if (!empty($batData['modelo_bateria']) || isset($batData['capacidad']) || isset($batData['autonomia'])) {
                Bateria::create([
                    'id_producto' => $producto->id_producto,
                    'modelo'      => $batData['modelo_bateria'] ?? null,
                    'capacidad'   => $batData['capacidad'] ?? 0,
                    'autonomia'   => $batData['autonomia'] ?? 0,
                ]);
            }
        } elseif ($producto->categoria === 'inversor') {
            $invData = $request->only(['modelo_inversor', 'potencia_nominal', 'eficiencia_inversor', 'tipo_inversor']);
            if (!empty($invData['modelo_inversor']) || isset($invData['potencia_nominal']) || isset($invData['eficiencia_inversor']) || isset($invData['tipo_inversor'])) {
                Inversor::create([
                    'id_producto'      => $producto->id_producto,
                    'modelo'           => $invData['modelo_inversor'] ?? null,
                    'potencia_nominal' => $invData['potencia_nominal'] ?? 0,
                    'eficiencia'       => $invData['eficiencia_inversor'] ?? 0,
                    'tipo'             => $invData['tipo_inversor'] ?? null,
                ]);
            }
        }

        return response()->json($producto->load(['panel', 'bateria', 'inversor']), 201);
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

            //  Opcionales por categoría
            'modelo_panel'   => 'nullable|string|max:100',
            'eficiencia'     => 'nullable|numeric',
            'superficie'     => 'nullable|numeric',
            'produccion'     => 'nullable|numeric',
            'modelo_bateria' => 'nullable|string|max:100',
            'capacidad'      => 'nullable|numeric',
            'autonomia'      => 'nullable|numeric',
            'modelo_inversor'     => 'nullable|string|max:100',
            'potencia_nominal'    => 'nullable|numeric',
            'eficiencia_inversor' => 'nullable|numeric',
            'tipo_inversor'       => 'nullable|string|max:10',
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

        $categoriaAnterior = $producto->categoria;
        $producto->update($data);

        // === Actualizar/crear características por categoría ===
        if ($producto->categoria === 'panel') {
            $panelData = $request->only(['modelo_panel', 'eficiencia', 'superficie', 'produccion']);
            if (!empty($panelData['modelo_panel']) || isset($panelData['eficiencia']) || isset($panelData['superficie']) || isset($panelData['produccion'])) {
                $panel = $producto->panel()->first();
                if (!$panel) $panel = new Panel(['id_producto' => $producto->id_producto]);
                if (!empty($panelData['modelo_panel'])) $panel->modelo = $panelData['modelo_panel'];
                if (isset($panelData['eficiencia']))    $panel->eficiencia = $panelData['eficiencia'];
                if (isset($panelData['superficie']))    $panel->superficie = $panelData['superficie'];
                if (isset($panelData['produccion']))    $panel->produccion = $panelData['produccion'];
                $panel->save();
            }
            // Si cambió de otra categoría a panel, limpia batería previa
            if ($categoriaAnterior !== 'panel') {
                $producto->bateria()?->delete();
                $producto->inversor()?->delete();
            }
        } elseif ($producto->categoria === 'bateria') {
            $batData = $request->only(['modelo_bateria', 'capacidad', 'autonomia']);
            if (!empty($batData['modelo_bateria']) || isset($batData['capacidad']) || isset($batData['autonomia'])) {
                $bat = $producto->bateria()->first();
                if (!$bat) $bat = new Bateria(['id_producto' => $producto->id_producto]);
                if (!empty($batData['modelo_bateria'])) $bat->modelo = $batData['modelo_bateria'];
                if (isset($batData['capacidad']))       $bat->capacidad = $batData['capacidad'];
                if (isset($batData['autonomia']))       $bat->autonomia = $batData['autonomia'];
                $bat->save();
            }
            // Si cambió de otra categoría a batería, limpia panel previo
            if ($categoriaAnterior !== 'bateria') {
                $producto->panel()?->delete();
                $producto->inversor()?->delete();
            }
        } elseif ($producto->categoria === 'inversor') {
            $invData = $request->only(['modelo_inversor', 'potencia_nominal', 'eficiencia_inversor', 'tipo_inversor']);
            if (!empty($invData['modelo_inversor']) || isset($invData['potencia_nominal']) || isset($invData['eficiencia_inversor']) || isset($invData['tipo_inversor'])) {
                $inv = $producto->inversor()->first();
                if (!$inv) $inv = new Inversor(['id_producto' => $producto->id_producto]);
                if (!empty($invData['modelo_inversor']))      $inv->modelo = $invData['modelo_inversor'];
                if (isset($invData['potencia_nominal']))      $inv->potencia_nominal = $invData['potencia_nominal'];
                if (isset($invData['eficiencia_inversor']))   $inv->eficiencia = $invData['eficiencia_inversor'];
                if (isset($invData['tipo_inversor']))         $inv->tipo = $invData['tipo_inversor'];
                $inv->save();
            }
            // Si cambió de otra categoría a inversor, limpia previos
            if ($categoriaAnterior !== 'inversor') {
                $producto->panel()?->delete();
                $producto->bateria()?->delete();
            }
        } else {
            // Si cambió a otra categoría distinta, limpia restos
            if ($request->filled('categoria') && $request->input('categoria') !== $categoriaAnterior) {
                $producto->panel()?->delete();
                $producto->bateria()?->delete();
                $producto->inversor()?->delete();
            }
        }
        // === GALERÍA (update) ===
        // mantener solo las que vengan en keep_galeria[], borrar resto
        $keep = $request->input('keep_galeria', []); // rutas relativas
        $dir = $this->galleryDir($producto->id_producto);

        if (Storage::disk('public')->exists($dir)) {
            $current = Storage::disk('public')->files($dir);
            $toDelete = array_diff($current, $keep);
            foreach ($toDelete as $del) {
                Storage::disk('public')->delete($del);
            }
        }

        // subir nuevas
        if ($request->hasFile('galeria')) {
            foreach ($request->file('galeria') as $file) {
                if ($file->isValid()) {
                    $file->store($dir, 'public');
                }
            }
        }

        // devolver con galería incluida
        $producto = $producto->fresh();
        $producto->panel = isset($producto->panel) ? $producto->panel : null; // no toco tu lógica
        $producto->bateria = isset($producto->bateria) ? $producto->bateria : null;
        $producto->inversor = isset($producto->inversor) ? $producto->inversor : null;
        $producto->galeria = $this->listGallery($producto->id_producto);
        return response()->json($producto);


        return response()->json($producto->load(['panel', 'bateria', 'inversor']));
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

            // Por si acaso (limpieza explícita)
            $producto->panel()?->delete();
            $producto->bateria()?->delete();
            $producto->inversor()?->delete();

            $producto->delete();
        });

        return response()->noContent();
    }
}
