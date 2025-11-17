<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AuthUserResource extends JsonResource
{
    public function toArray($request)
    {
        $base = [
            'id'    => $this->id,
            'name'  => $this->name,
            'email' => $this->email,
            'rol'   => $this->rol,     // <- tu campo real
        ];

        if ($this->rol === 'vendedor' && $this->perfilVendedor) {
            $base['profile'] = [
                'telefono' => $this->perfilVendedor->telefono,
                'zona'     => $this->perfilVendedor->zona,
            ];
        } elseif ($this->rol === 'cliente' && $this->perfilCliente) {
            $base['profile'] = [
                'telefono'  => $this->perfilCliente->telefono,
                'direccion' => $this->perfilCliente->direccion,
            ];
        } else {
            $base['profile'] = null;
        }

        return $base;
    }
}
