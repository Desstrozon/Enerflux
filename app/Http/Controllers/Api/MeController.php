<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MeController extends Controller
{
    public function profile(Request $r) {
  $u = $r->user()->load(['perfilCliente','perfilVendedor']);
  return response()->json([
    'id'    => $u->id,
    'name'  => $u->name,
    'email' => $u->email,
    'rol'   => $u->rol,
    'cliente'  => $u->perfilCliente,
    'vendedor' => $u->perfilVendedor,
  ]);
}

public function updateProfile(Request $r) {
  $u = $r->user();

  $base = $r->validate([
    'name'  => 'sometimes|string|max:255',
    'email' => 'sometimes|email|max:255',
  ]);
  if ($base) $u->update($base);

  if ($u->rol === 'cliente') {
    $data = $r->validate([
      'telefono'      => 'nullable|string|max:30',
      // legacy: si solo envías 'direccion' seguirá guardando
      'direccion'     => 'nullable|string|max:190',
      // nuevos:
      'address_line1' => 'nullable|string|max:190',
      'address_line2' => 'nullable|string|max:190',
      'city'          => 'nullable|string|max:120',
      'province'      => 'nullable|string|max:120',
      'postal_code'   => 'nullable|string|max:16',
      'country'       => 'nullable|string|size:2',
    ]);
    $u->perfilCliente()->updateOrCreate(['id_usuario' => $u->id], $data);
  }

  return response()->json(['ok' => true]);
}
}
