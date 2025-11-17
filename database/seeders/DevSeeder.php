<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\PerfilAdministrador;
use App\Models\PerfilCliente;
use App\Models\PerfilVendedor;

class DevSeeder extends Seeder
{
    public function run(): void
    {
        // 🔸 ADMIN
        $admin = User::updateOrCreate(
            ['email' => 'admin@test.com'],
            ['name' => 'Admin', 'password' => bcrypt('12345678'), 'rol' => 'administrador']
        );

        PerfilAdministrador::updateOrCreate(
            ['id_usuario' => $admin->id],
            ['telefono' => '600000000', 'departamento' => 'Sistemas']
        );

        // 🔸 CLIENTE
        $cliente = User::updateOrCreate(
            ['email' => 'cliente@test.com'],
            ['name' => 'Cliente Demo', 'password' => bcrypt('12345678'), 'rol' => 'cliente']
        );

        PerfilCliente::updateOrCreate(
            ['id_usuario' => $cliente->id],
            ['telefono' => '611111111', 'direccion' => 'Calle Energía 1']
        );

        // 🔸 VENDEDOR
        $vendedor = User::updateOrCreate(
            ['email' => 'vendedor@test.com'],
            ['name' => 'Vendedor Demo', 'password' => bcrypt('12345678'), 'rol' => 'vendedor']
        );

        PerfilVendedor::updateOrCreate(
            ['id_usuario' => $vendedor->id],
            ['telefono' => '622222222', 'zona' => 'Valencia Norte']
        );
    }
}
