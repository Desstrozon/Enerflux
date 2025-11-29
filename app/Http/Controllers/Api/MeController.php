<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class MeController extends Controller
{
  public function profile(Request $r)
  {
    $u = $r->user()->load(['perfilCliente', 'perfilVendedor']);
    $pc = $u->perfilCliente;
    $pv = $u->perfilVendedor;

    return response()->json([
      'id'    => $u->id,
      'name'  => $u->name,
      'email' => $u->email,
      'rol'   => $u->rol,

      // campos “planos” de compatibilidad
      'telefono'  => optional($pc)->telefono ?? optional($pv)->telefono,
      'direccion' => optional($pc)->direccion,

      // objetos completos que usa tu front
      'perfilCliente'  => $pc,
      'perfilVendedor' => $pv,

      // alias por compatibilidad previa
      'cliente'  => $pc,
      'vendedor' => $pv,
    ]);
  }

  public function updateProfile(Request $r)
  {
    $u = $r->user();

    // 1) básicos
    $base = $r->validate([
      'name'  => 'sometimes|string|max:255',
      'email' => 'sometimes|email|max:255',
    ]);
    if (!empty($base)) {
      $u->update($base);
    }

    // 2) cliente
    if ($u->rol === 'cliente') {
      $perfilActual = $u->perfilCliente;

      $data = $r->validate([
        'telefono'      => 'nullable|string|max:30',
        'direccion'     => 'nullable|string|max:190',

        'address_line1' => 'nullable|string|max:190',
        'address_line2' => 'nullable|string|max:190',
        'city'          => 'nullable|string|max:120',
        'province'      => 'nullable|string|max:120',
        'postal_code'   => 'nullable|string|max:16',
        'country'       => 'nullable|string|size:2',
      ]);

      // teléfono no-nulo si tu columna no acepta NULL
      $telefono = $data['telefono']
        ?? $perfilActual?->telefono
        ?? '';

      $payload = [
        'telefono'      => $telefono,
        'direccion'     => $data['direccion']     ?? $perfilActual?->direccion ?? null,
        'address_line1' => $data['address_line1'] ?? $perfilActual?->address_line1 ?? null,
        'address_line2' => $data['address_line2'] ?? $perfilActual?->address_line2 ?? null,
        'city'          => $data['city']          ?? $perfilActual?->city ?? null,
        'province'      => $data['province']      ?? $perfilActual?->province ?? null,
        'postal_code'   => $data['postal_code']   ?? $perfilActual?->postal_code ?? null,
        'country'       => $data['country']       ?? $perfilActual?->country ?? 'ES',
      ];

      //  clave foránea real: id_usuario
      $u->perfilCliente()->updateOrCreate(
        ['id_usuario' => $u->id],
        $payload
      );
    }

    // 3) vendedor
    if ($u->rol === 'vendedor') {
      $data = $r->validate([
        'telefono' => 'nullable|string|max:30',
        'zona'     => 'nullable|string|max:191',
      ]);

      $telefono = $data['telefono']
        ?? $u->perfilVendedor?->telefono
        ?? '';

      $payload = [
        'telefono' => $telefono,
        'zona'     => $data['zona'] ?? $u->perfilVendedor?->zona ?? null,
      ];

      //  clave foránea real: id_usuario
      $u->perfilVendedor()->updateOrCreate(
        ['id_usuario' => $u->id],
        $payload
      );
    }

    return response()->json(['ok' => true]);
  }

  public function updatePassword(Request $request)
  {
    $request->validate([
      'current_password'      => 'required|string',
      'password'              => 'required|string|min:8|confirmed',
    ]);

    $user = $request->user();
    if (! \Illuminate\Support\Facades\Hash::check($request->current_password, $user->password)) {
      return response()->json(['message' => 'La contraseña actual no es válida'], 422);
    }

    $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
    $user->save();

    return response()->json(['message' => 'Contraseña actualizada']);
  }
}
