<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class VendorRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $telefono,
        public string $zona,
        public string $brand,
        public string $company,
        public string $website,
        public ?string $message
    ) {
    }

    public function build()
    {
        return $this->subject('Nueva solicitud de vendedor - Enerflux')
                    ->view('mail.vendor_request_admin');
    }
}
