<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool     { return $user->isAdmin(); }
    public function view(User $user, User $model): bool { return $user->isAdmin() || $user->id === $model->id; }

    public function create(User $user): bool      { return $user->isAdmin(); }

    public function update(User $user, User $model): bool
    {
        // Admin puede editar cualquiera. No admin solo su propia cuenta (sin cambiar rol).
        return $user->isAdmin() || $user->id === $model->id;
    }

    public function delete(User $user, User $model): bool
    {
        // Admin puede borrar a otros, pero no a sí mismo ni dejar el sistema sin admin
        if (!$user->isAdmin()) return false;
        if ($user->id === $model->id) return false;

        // impedir borrar al último admin
        $admins = User::query()->whereIn('rol', ['admin','administrador'])->count();
        if (in_array(strtolower($model->rol ?? ''), ['admin','administrador'], true) && $admins <= 1) {
            return false;
        }
        return true;
    }
}
