<?php

namespace App\Http\Middleware;

use Closure;

class EnsureRole
{
    public function handle($request, Closure $next, ...$roles)
    {
        $user = $request->user();
        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        // usa 'rol'; acepta también 'role' por compatibilidad
        $role = strtolower($user->rol ?? $user->role ?? '');

        // si el middleware se usa sin argumentos, exige admin por defecto
        if (empty($roles)) {
            $roles = ['administrador','admin'];
        } else {
            $roles = array_map('strtolower', $roles);
        }

        if (!in_array($role, $roles)) {
            abort(403, 'Forbidden.');
        }

        return $next($request);
    }
}