<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
// Si quieres que se procese en cola, descomenta la siguiente línea
// use Illuminate\Contracts\Queue\ShouldQueue;

class OrderPaidNotification extends Notification
{
    use Queueable;

    public function __construct(public Order $order)
    {
    }

    /**
     * Canales por los que se envía la notificación.
     * Solo base de datos; el email ya lo envía OrderPaidMail.
     */
    public function via($notifiable): array
    {
        return ['database']; // ['mail', 'database'] si quisiera también correo aquí
    }

    /**
     * Lo que se guardará en la tabla notifications->data (JSON).
     */
    public function toArray($notifiable): array
    {
        return [
            'type'      => 'order_paid',
            'order_id'  => $this->order->id,
            'amount'    => $this->order->amount,
            'currency'  => $this->order->currency,
            'status'    => $this->order->status,
            'created_at'=> $this->order->created_at?->toIso8601String(),
        ];
    }
}
