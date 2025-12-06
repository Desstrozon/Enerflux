<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PerfilVendedor;
use App\Models\PerfilCliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    //  Listar todos los usuarios (admin)
    public function index(Request $request)
    {
        $this->ensureAdmin($request);

        $q = trim((string) $request->query('q', ''));

        $users = User::with([
            'perfilCliente:id_usuario,telefono,direccion,address_line1,address_line2,city,province,postal_code,country',
            'perfilVendedor:id_usuario,telefono,zona,brand,company,website,message',
        ])
            ->when($q !== '', function ($query) use ($q) {
                $like = "%{$q}%";
                $query->where(function ($w) use ($like, $q) {
                    $w->where('name', 'like', $like)
                        ->orWhere('email', 'like', $like)
                        ->orWhere('rol', 'like', $like);
                    if (is_numeric($q)) {
                        $w->orWhere('id', (int) $q);
                    }
                });
            })
            ->orderBy('id', 'asc')
            ->get();

        // Devolvemos todo aplanado para el frontend
        $res = $users->map(function (User $u) {
            $pc = $u->perfilCliente;
            $pv = $u->perfilVendedor;

            return [
                'id'        => $u->id,
                'name'      => $u->name,
                'email'     => $u->email,
                'rol'       => $u->rol,

                'telefono'       => $pc->telefono
                    ?? $pv->telefono
                    ?? null,
                'direccion'      => $pc->direccion ?? null,
                'address_line1'  => $pc->address_line1 ?? null,
                'address_line2'  => $pc->address_line2 ?? null,
                'city'           => $pc->city ?? null,
                'province'       => $pc->province ?? null,
                'postal_code'    => $pc->postal_code ?? null,
                'country'        => $pc->country ?? null,

                'zona'           => $pv->zona ?? null,
                'brand'          => $pv->brand ?? null,
                'company'        => $pv->company ?? null,
                'website'        => $pv->website ?? null,
                'message'        => $pv->message ?? null,
            ];
        });

        return response()->json($res);
    }

    //  Solo vendedores (admin)
    public function vendedores(Request $request)
    {
        $this->ensureAdmin($request);

        $q = trim((string) $request->query('q', ''));
        $res = User::where('rol', 'vendedor')
            ->with('perfilVendedor')
            ->select('id', 'name', 'email', 'rol')
            ->when($q !== '', function ($query) use ($q) {
                $like = "%{$q}%";
                $query->where(function ($w) use ($like, $q) {
                    $w->where('name', 'like', $like)
                        ->orWhere('email', 'like', $like);
                    if (is_numeric($q)) $w->orWhere('id', (int)$q);
                });
            })
            ->orderBy('id', 'asc')
            ->get();

        return response()->json($res);
    }

    //  Solicitudes de vendedor PENDIENTES (solo admin)
    public function vendorRequests(Request $request)
    {
        $this->ensureAdmin($request);

        $q = trim((string) $request->query('q', ''));

        $rows = User::where('rol', 'vendedor')
            ->where('vendor_status', 'pending')
            ->with(['perfilVendedor' => function ($q2) {
                $q2->select(
                    'id_usuario',
                    'telefono',
                    'zona',
                    'brand',
                    'company',
                    'website',
                    'message'
                );
            }])
            ->select('id', 'name', 'email', 'rol', 'vendor_status', 'vendor_notes')
            ->when($q !== '', function ($query) use ($q) {
                $like = "%{$q}%";
                $query->where(function ($w) use ($like) {
                    $w->where('name', 'like', $like)
                        ->orWhere('email', 'like', $like);
                });
            })
            ->orderBy('id', 'asc')
            ->get();

        return response()->json($rows);
    }

    //  Crear usuario (solo admin)
    public function store(Request $request)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'rol'      => ['required', 'string', Rule::in(['admin', 'administrador', 'vendedor', 'cliente'])],

            // perfil común / cliente
            'telefono'       => ['nullable', 'string', 'max:50'],
            'direccion'      => ['nullable', 'string', 'max:255'],
            'address_line1'  => ['nullable', 'string', 'max:255'],
            'address_line2'  => ['nullable', 'string', 'max:255'],
            'city'           => ['nullable', 'string', 'max:255'],
            'province'       => ['nullable', 'string', 'max:255'],
            'postal_code'    => ['nullable', 'string', 'max:50'],
            'country'        => ['nullable', 'string', 'max:100'],

            // perfil vendedor
            'zona'           => ['nullable', 'string', 'max:255'],
            'brand'          => ['nullable', 'string', 'max:255'],
            'company'        => ['nullable', 'string', 'max:255'],
            'website'        => ['nullable', 'string', 'max:255'],
            'message'        => ['nullable', 'string'],
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'rol'      => strtolower($data['rol']),
        ]);

        // crear perfil según rol
        if ($user->rol === 'vendedor') {
            $pv = new PerfilVendedor(['id_usuario' => $user->id]);
            foreach (['telefono', 'zona', 'brand', 'company', 'website', 'message'] as $f) {
                if (array_key_exists($f, $data)) {
                    $pv->{$f} = $data[$f];
                }
            }
            $pv->save();
        } elseif ($user->rol === 'cliente') {
            $pc = new PerfilCliente(['id_usuario' => $user->id]);

            foreach (
                [
                    'telefono',
                    'direccion',
                    'address_line1',
                    'address_line2',
                    'city',
                    'province',
                    'postal_code',
                    'country',
                ] as $f
            ) {
                if (array_key_exists($f, $data)) {
                    //  dirección nunca puede ser null por la constraint NOT NULL
                    if ($f === 'direccion') {
                        $pc->{$f} = $data[$f] ?? '';
                    } else {
                        $pc->{$f} = $data[$f];
                    }
                }
            }

            // por si no venía en el payload, garantizamos string vacío
            if ($pc->direccion === null) {
                $pc->direccion = '';
            }

            $pc->save();
        }

        $user->load(['perfilCliente', 'perfilVendedor']);

        return response()->json($user, 201);
    }


    //  Actualizar usuario (admin o propio)
    public function update(Request $request, $id)
    {
        $auth = $request->user();
        $user = User::findOrFail($id);

        $isAdmin = $this->isAdmin($auth);
        $isSelf  = $auth && $auth->id === $user->id;
        abort_unless($isAdmin || $isSelf, 403, 'No autorizado');

        $rules = [
            'name'     => ['sometimes', 'string', 'max:255'],
            'email'    => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:6'],
        ];

        // NO permitimos cambiar el rol (comentado para evitar problemas)
        // if ($isAdmin) {
        //     $rules['rol'] = ['sometimes', 'string', Rule::in(['admin', 'administrador', 'vendedor', 'cliente'])];
        // }

        //  CAMPOS DE PERFIL (cliente + vendedor)
        $rules += [
            'telefono'      => ['nullable', 'string', 'max:50'],
            'zona'          => ['nullable', 'string', 'max:255'],
            'direccion'     => ['nullable', 'string', 'max:255'],
            'address_line1' => ['nullable', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'city'          => ['nullable', 'string', 'max:255'],
            'province'      => ['nullable', 'string', 'max:255'],
            'postal_code'   => ['nullable', 'string', 'max:50'],
            'country'       => ['nullable', 'string', 'max:100'],
            // perfil vendedor extra
            'brand'   => ['nullable', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'website' => ['nullable', 'string', 'max:255'],
            'message' => ['nullable', 'string', 'max:2000'],
        ];

        $data = $request->validate($rules);

        // === user básico (sin cambiar rol) ===
        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }
        if (isset($data['name']))  $user->name  = $data['name'];
        if (isset($data['email'])) $user->email = $data['email'];
        // NO cambiamos el rol
        $user->save();

        // === perfiles (aquí añadimos campos nuevos) ===
        if ($user->rol === 'vendedor') {
            $profile = PerfilVendedor::firstOrCreate(['id_usuario' => $user->id]);

            if (array_key_exists('telefono', $data)) $profile->telefono = $data['telefono'];
            if (array_key_exists('zona', $data))     $profile->zona     = $data['zona'];
            if (array_key_exists('brand', $data))    $profile->brand    = $data['brand'];
            if (array_key_exists('company', $data))  $profile->company  = $data['company'];
            if (array_key_exists('website', $data))  $profile->website  = $data['website'];
            if (array_key_exists('message', $data))  $profile->message  = $data['message'];

            $profile->save();
        } elseif ($user->rol === 'cliente') {
            $profile = PerfilCliente::firstOrCreate(['id_usuario' => $user->id]);

            if (array_key_exists('telefono', $data))      $profile->telefono      = $data['telefono'];
            if (array_key_exists('direccion', $data))     $profile->direccion     = $data['direccion'] ?? '';

            if (array_key_exists('address_line1', $data)) $profile->address_line1 = $data['address_line1'];
            if (array_key_exists('address_line2', $data)) $profile->address_line2 = $data['address_line2'];
            if (array_key_exists('city', $data))          $profile->city          = $data['city'];
            if (array_key_exists('province', $data))      $profile->province      = $data['province'];
            if (array_key_exists('postal_code', $data))   $profile->postal_code   = $data['postal_code'];
            if (array_key_exists('country', $data))       $profile->country       = $data['country'];

            $profile->save();
        }


        $user->load(['perfilCliente', 'perfilVendedor']);

        return response()->json([
            'message' => 'Usuario actualizado correctamente',
            'user'    => $user,
        ]);
    }



    //  Eliminar usuario (solo admin; evita borrarse a sí mismo)
    public function destroy(Request $request, $id)
    {
        $this->ensureAdmin($request);

        abort_if($request->user()->id == $id, 422, 'No puedes eliminar tu propia cuenta.');

        $user = User::findOrFail($id);

        // limpia perfiles asociados (por si tu esquema no tiene cascade)
        $user->perfilVendedor()?->delete();
        $user->perfilCliente()?->delete();

        $user->delete();

        return response()->json(['message' => 'Usuario eliminado correctamente']);
    }

    //  Actualizar perfil propio (cliente/vendedor/admin)
    public function updateSelf(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name'        => ['sometimes', 'string', 'max:255'],
            'email'       => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],

            // COMÚN
            'telefono'       => ['nullable', 'string', 'max:50'],

            // Vendedor
            'zona'           => ['nullable', 'string', 'max:255'],
            'brand'          => ['nullable', 'string', 'max:255'],
            'company'        => ['nullable', 'string', 'max:255'],
            'website'        => ['nullable', 'string', 'max:255'],
            'message'        => ['nullable', 'string'],

            // Cliente
            'direccion'      => ['nullable', 'string', 'max:255'],
            'country'        => ['nullable', 'string', 'max:2'],
            'city'           => ['nullable', 'string', 'max:120'],
            'postal_code'    => ['nullable', 'string', 'max:30'],
            'address_line1'  => ['nullable', 'string', 'max:255'],
            'address_line2'  => ['nullable', 'string', 'max:255'],
        ]);

        if (isset($data['name']))  $user->name  = $data['name'];
        if (isset($data['email'])) $user->email = $data['email'];
        $user->save();

        if ($user->rol === 'vendedor') {
            $profile = PerfilVendedor::firstOrCreate(['id_usuario' => $user->id]);

            foreach (['telefono', 'zona', 'brand', 'company', 'website', 'message'] as $field) {
                if (array_key_exists($field, $data)) {
                    $profile->{$field} = $data[$field];
                }
            }

            $profile->save();
        } elseif ($user->rol === 'cliente') {
            $profile = PerfilCliente::firstOrCreate(['id_usuario' => $user->id]);

            foreach (
                [
                    'telefono',
                    'direccion',
                    'country',
                    'city',
                    'postal_code',
                    'address_line1',
                    'address_line2',
                ] as $field
            ) {
                if (array_key_exists($field, $data)) {
                    $profile->{$field} = $data[$field];
                }
            }

            $profile->save();
        }

        $user->load(['perfilCliente', 'perfilVendedor']);
        return response()->json(['message' => 'Perfil actualizado', 'user' => $user]);
    }

    //  Cambiar contraseña (propio)
    public function changePassword(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'string', 'min:6', 'confirmed'], // requiere password_confirmation
        ]);

        abort_unless(Hash::check($data['current_password'], $user->password), 422, 'La contraseña actual no es válida');

        $user->password = Hash::make($data['password']);
        $user->save();

        return response()->json(['message' => 'Contraseña actualizada']);
    }

    /* ===========================
       Helpers de autorización
    ============================ */
    private function isAdmin(?User $u): bool
    {
        $rol = strtolower($u->rol ?? '');
        return in_array($rol, ['admin', 'administrador'], true);
    }

    private function ensureAdmin(Request $r): void
    {
        abort_unless($this->isAdmin($r->user()), 403, 'Solo administradores');
    }
}
