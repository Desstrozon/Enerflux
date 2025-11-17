<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    // puede ver un pedido concreto
    public function view(User $user, Order $order): bool
    {
        return $user->id === $order->user_id || in_array($user->role, ['admin']);
    }

    // listar “mis pedidos”
    public function viewAny(User $user): bool
    {
        return $user !== null; // con auth basta
    }

    // descargar factura
    public function downloadInvoice(User $user, Order $order): bool
    {
        return $this->view($user, $order);
    }
}
