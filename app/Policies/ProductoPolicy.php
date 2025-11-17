<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Producto;

class ProductoPolicy
{
    /** Admin puede todo */
    public function before(User $user, string $ability)
    {
        if ($user->isAdmin()) {   // usa tu helper de User
            return true;
        }
        return null;
    }

    /** Listado/detalle públicos */
    public function viewAny(?User $user): bool { return true; }
    public function view(?User $user, Producto $producto): bool { return true; }

    /** Crear/editar/borrar */
    public function create(User $user): bool
    {
        // Si SOLO admin puede crear, no hace falta más: el admin ya pasó por before()
        // y aquí devolvemos false para los demás perfiles
        return false;
    }

    public function update(User $user, Producto $producto): bool
    {
        // idem: solo admin (pasa por before). Resto no autorizado.
        return false;
    }

    public function delete(User $user, Producto $producto): bool
    {
        // idem
        return false;
    }
}
