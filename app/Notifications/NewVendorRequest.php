<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;           
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class NewVendorRequest extends Notification implements ShouldQueue 
{
    use Queueable;

    public function __construct(public \App\Models\User $vendor)
    {
    }

    /** Canales de entrega */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /** Contenido del email */
    public function toMail($notifiable)
    {
        // Cargamos perfil
        $this->vendor->loadMissing('perfilVendedor');
        $perfil = $this->vendor->perfilVendedor;

        return (new MailMessage)
            ->subject('Nueva solicitud de vendedor - Enerflux')
            ->view('mail.vendor_request_admin', [
                'user' => $this->vendor,
                'telefono' => $perfil->telefono ?? '—',
                'zona' => $perfil->zona ?? '—',
                'brand' => $perfil->brand ?? '—',
                'company' => $perfil->company ?? '—',
                'website' => $perfil->website ?? '—',
                'message' => $perfil->message ?? null,
            ]);
    }


    /** payload para database notifications si algún día se habilita */
    public function toArray(object $notifiable): array
    {
        return [
            'vendor_id'    => $this->vendor->id,
            'vendor_email' => $this->vendor->email,
            'vendor_name'  => $this->vendor->name,
        ];
    }
}
