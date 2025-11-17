<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderPaidMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;
    public string $pdf; // bytes del pdf ya renderizado

    public function __construct(Order $order, string $pdf)
    {
        $this->order = $order;
        $this->pdf   = $pdf;
    }

    public function build()
    {
        $filename = 'Factura-'.$this->order->id.'.pdf';

        return $this->subject('¡Gracias por tu compra! Pedido #'.$this->order->id)
            ->view('mail.order_paid')
            ->with([
                'order' => $this->order,
            ])
            ->attachData($this->pdf, $filename, [
                'mime' => 'application/pdf',
            ]);
    }
}
