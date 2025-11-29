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

        $mail = (new MailMessage)
            ->subject('Nueva solicitud de vendedor')
            ->greeting('Hola, administrador/a')
            ->line("{$this->vendor->name} ({$this->vendor->email}) ha solicitado ser vendedor.")
            ->line('Datos del vendedor:')
            ->line('Teléfono: ' . ($perfil->telefono ?? '—'))
            ->line('Zona: ' . ($perfil->zona ?? '—'))
            ->line('Marca: ' . ($perfil->brand ?? '—'))
            ->line('Empresa: ' . ($perfil->company ?? '—'))
            ->line('Web: ' . ($perfil->website ?? '—'));

        if (!empty($perfil?->message)) {
            $mail->line('Mensaje:')
                 ->line($perfil->message);
        }

        // puedes cambiar esta URL al front si quieres
        $mail->action('Revisar solicitudes', url('/admin/vendors/requests'));

        return $mail;
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
