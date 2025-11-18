<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use App\Models\Producto;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    // GET /productos/{producto}/reviews
    public function index($productoId)
    {
        // media y conteo desde la tabla
        $agg = ProductReview::where('producto_id', $productoId)
            ->selectRaw('COALESCE(AVG(rating),0) as avg, COUNT(*) as count')
            ->first();

        $reviews = ProductReview::where('producto_id', $productoId)
            ->with(['user:id,name'])
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'avg'     => round((float)$agg->avg, 2),
            'count'   => (int)$agg->count,
            'reviews' => $reviews->map(function ($r) {
                return [
                    'id'          => (int)$r->id,
                    'producto_id' => (int)$r->producto_id,
                    'user_id'     => (int)$r->user_id,
                    'rating'      => (float)$r->rating,
                    'comment'     => $r->comment,
                    'likes'       => (int)$r->likes,
                    'dislikes'    => (int)$r->dislikes,
                    'created_at'  => $r->created_at?->toISOString(),
                    'user'        => $r->relationLoaded('user') ? ['id' => $r->user->id, 'name' => $r->user->name] : null,
                ];
            }),
        ]);
    }

    /** Crear/actualizar la reseña del usuario autenticado sobre un producto */
    public function storeOrUpdate(Request $request, $productoId)
    {
        $user = $request->user();
        $producto = Producto::where('id_producto', $productoId)->firstOrFail();

        $data = $request->validate([
            'rating'  => ['required', 'numeric', 'min:0.5', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        $rev = ProductReview::firstOrNew([
            'producto_id' => $producto->id_producto,
            'user_id'     => $user->id,
        ]);

        $rev->rating   = (float) $data['rating'];
        $rev->comment  = $data['comment'] ?? null;
        $rev->likes    = $rev->exists ? $rev->likes : 0;
        $rev->dislikes = $rev->exists ? $rev->dislikes : 0;
        $rev->save();

        return response()->json(['ok' => true, 'review' => $rev]);
    }

    /** Like/Dislike */
    public function react(Request $request, $id)
    {
        $request->validate([
            'type' => ['required', 'in:like,dislike']
        ]);

        $rev = ProductReview::findOrFail($id);
        // (Opcional) evitar múltiples reacciones por usuario: guarda una tabla adicional si lo necesitas

        if ($request->type === 'like')     $rev->likes    = (int)$rev->likes + 1;
        if ($request->type === 'dislike')  $rev->dislikes = (int)$rev->dislikes + 1;

        $rev->save();

        return response()->json(['ok' => true, 'review' => $rev]);
    }

    // DELETE /reviews/{review}
    public function destroy(Request $request, ProductReview $review)
    {
        $u = $request->user();
        abort_unless($u, 401, 'Auth required');

        $isAdmin = in_array(strtolower($u->rol ?? ''), ['admin', 'administrador'], true);
        abort_unless($isAdmin || $u->id === (int)$review->user_id, 403, 'No autorizado');

        $review->delete();

        // Recalcular (útil si quieres devolverlo ya listo)
        $agg = ProductReview::where('producto_id', $review->producto_id)
            ->selectRaw('COALESCE(AVG(rating),0) as avg, COUNT(*) as count')
            ->first();

        return response()->json([
            'ok'   => true,
            'avg'  => round((float)($agg->avg ?? 0), 2),
            'count' => (int)($agg->count ?? 0),
        ]);
    }
}
