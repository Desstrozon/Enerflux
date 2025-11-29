<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\AuthUserResource;
use App\Models\User;
use App\Models\PerfilVendedor;
use App\Models\PerfilCliente;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use App\Notifications\NewVendorRequest;

class RegisterController extends Controller
{
    public function store(RegisterRequest $request)
    {
        // Si el front envía 'role', lo mapeamos a 'rol' para User 
        $data = $request->validated();

        $brand   = (string) ($data['vendor_brand']   ?? '');
        $company = (string) ($data['vendor_company'] ?? '');
        $website = (string) ($data['vendor_website'] ?? '');
        $message = (string) ($data['vendor_message'] ?? '');

        if (isset($data['role']) && !isset($data['rol'])) {
            $data['rol'] = $data['role'];
        }

        return DB::transaction(function () use ($data, $brand, $company, $website, $message) {
            $isVendor = ($data['rol'] === 'vendedor');

            // Con tu User::casts la contraseña se hashea automáticamente (password => hashed)
            $user = User::create([
                'name'          => $data['name'],
                'email'         => $data['email'],
                'password'      => $data['password'],
                'rol'           => $data['rol'], // cliente | vendedor
                //  SOLO SI ES VENDEDOR: queda pendiente hasta aprobación del admin
                'vendor_status' => $isVendor ? 'pending' : 'approved',
                'vendor_note'  => $data['rol'] === 'vendedor'
                    ? trim("Marca: {$brand}\nEmpresa: {$company}\nWeb: {$website}\nMensaje: {$message}")
                    : null,
            ]);

            // Crear perfil según rol usando id_usuario como PK/ FK (tu esquema)
            if ($isVendor) {
                PerfilVendedor::create([
                    'id_usuario' => $user->id,
                    'telefono'   => $data['telefono'] ?? null,   // vendedor sí envia teléfono
                    'zona'       => $data['zona'] ?? null,
                    'brand'      => $data['vendor_brand']   ?? null,
                    'company'    => $data['vendor_company'] ?? null,
                    'website'    => $data['vendor_website'] ?? null,
                    'message'    => $data['vendor_message'] ?? null,
                ]);

                //  Avisar por email a los administradores
                Notification::send(
                    User::whereIn('rol', ['admin', 'administrador'])->get(),
                    new NewVendorRequest($user)
                );
            } else { // cliente
                PerfilCliente::create([
                    'id_usuario' => $user->id,
                    'telefono'   => $data['telefono'] ?? '',
                    'direccion'  => $data['direccion'] ?? '',
                ]);
            }

            // Generar token Sanctum
            $token = $user->createToken('api')->plainTextToken;

            // Cargar relaciones para el resource
            $user->load(['perfilVendedor', 'perfilCliente']);

            return response()->json([
                'token' => $token,
                'user'  => new AuthUserResource($user),
            ], 201);
        });
    }
}
