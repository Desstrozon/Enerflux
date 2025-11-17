<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EnsureUserIsAdmin
{
    /**
     * Verifica si el usuario autenticado tiene rol admin.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user(); // obtiene el usuario del token Sanctum

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Soporta tanto $user->role como relación $user->role->name
        $roleRaw = $user->role->name ?? $user->role ?? '';
        $role = Str::of($roleRaw)->lower()->value();

        if (!in_array($role, ['admin', 'administrador'], true)) {
            return response()->json(['message' => 'Forbidden. Admin only.'], 403);
        }

        return $next($request);
    }
}
