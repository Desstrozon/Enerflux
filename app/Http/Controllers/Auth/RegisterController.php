<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\AuthUserResource;
use App\Models\User;
use App\Models\PerfilVendedor;
use App\Models\PerfilCliente;
use Illuminate\Support\Facades\DB;

class RegisterController extends Controller
{
    public function store(RegisterRequest $request)
    {
        // Si el front envía 'role', lo mapeamos a 'rol' para tu User
        $data = $request->validated();
        if (isset($data['role']) && !isset($data['rol'])) {
            $data['rol'] = $data['role'];
        }

        return DB::transaction(function () use ($data) {
            // Con tu User::casts la contraseña se hashea automáticamente (password => hashed)
            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'password' => $data['password'],
                'rol'      => $data['rol'], // cliente | vendedor
            ]);

            // Crear perfil según rol usando id_usuario como PK/ FK (tu esquema)
            if ($data['rol'] === 'vendedor') {
                PerfilVendedor::create([
                    'id_usuario' => $user->id,
                    'telefono'   => $data['telefono'],
                    'zona'       => $data['zona'],
                ]);
            } else { // cliente
                PerfilCliente::create([
                    'id_usuario' => $user->id,
                    'telefono'   => $data['telefono'],
                    'direccion'  => $data['direccion'],
                ]);
            }

            // Generar token Sanctum
            $token = $user->createToken('api')->plainTextToken;

            // Cargar relaciones para el resource
            $user->load(['perfilVendedor','perfilCliente']);

            return response()->json([
                'token' => $token,
                'user'  => new AuthUserResource($user),
            ], 201);
        });
    }
}
