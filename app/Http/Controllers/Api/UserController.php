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
    // 🔹 Listar todos los usuarios (admin)
    public function index(Request $request)
    {
        $this->ensureAdmin($request);

        $q = trim((string) $request->query('q', ''));
        $res = User::with(['perfilCliente', 'perfilVendedor'])
            ->select('id', 'name', 'email', 'rol')
            ->when($q !== '', function ($query) use ($q) {
                $like = "%{$q}%";
                $query->where(function ($w) use ($like, $q) {
                    $w->where('name', 'like', $like)
                      ->orWhere('email', 'like', $like)
                      ->orWhere('rol', 'like', $like);
                    if (is_numeric($q)) $w->orWhere('id', (int)$q);
                });
            })
            ->orderBy('id', 'asc')
            ->get();

        return response()->json($res);
    }

    // 🔹 Solo vendedores (admin)
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

    // 🔹 Crear usuario (solo admin)
    public function store(Request $request)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'name'     => ['required','string','max:255'],
            'email'    => ['required','email','max:255','unique:users,email'],
            'password' => ['required','string','min:6'],
            'rol'      => ['required', 'string', Rule::in(['admin','administrador','vendedor','cliente'])],
            // campos de perfil opcionales
            'telefono'  => ['nullable','string','max:50'],
            'zona'      => ['nullable','string','max:255'],      // vendedor
            'direccion' => ['nullable','string','max:255'],      // cliente
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'rol'      => strtolower($data['rol']),
        ]);

        // crear perfil según rol
        if ($user->rol === 'vendedor') {
            PerfilVendedor::create([
                'id_usuario' => $user->id,
                'telefono'   => $data['telefono'] ?? null,
                'zona'       => $data['zona'] ?? null,
            ]);
        } elseif ($user->rol === 'cliente') {
            PerfilCliente::create([
                'id_usuario' => $user->id,
                'telefono'   => $data['telefono'] ?? null,
                'direccion'  => $data['direccion'] ?? null,
            ]);
        }

        $user->load(['perfilCliente','perfilVendedor']);

        return response()->json($user, 201);
    }

    // 🔹 Actualizar usuario (admin o propio)
    public function update(Request $request, $id)
    {
        $auth = $request->user();
        $user = User::findOrFail($id);

        $isAdmin = $this->isAdmin($auth);
        $isSelf  = $auth && $auth->id === $user->id;
        abort_unless($isAdmin || $isSelf, 403, 'No autorizado');

        $rules = [
            'name'     => ['sometimes','string','max:255'],
            'email'    => ['sometimes','email','max:255', Rule::unique('users','email')->ignore($user->id)],
            'password' => ['nullable','string','min:6'],
        ];
        // solo admin puede cambiar rol
        if ($isAdmin) {
            $rules['rol'] = ['sometimes','string', Rule::in(['admin','administrador','vendedor','cliente'])];
        }

        // campos de perfil
        $rules += [
            'telefono'  => ['nullable','string','max:50'],
            'zona'      => ['nullable','string','max:255'],
            'direccion' => ['nullable','string','max:255'],
        ];

        $data = $request->validate($rules);

        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }
        if (isset($data['name']))  $user->name  = $data['name'];
        if (isset($data['email'])) $user->email = $data['email'];
        if ($isAdmin && isset($data['rol'])) $user->rol = strtolower($data['rol']);
        $user->save();

        // actualizar/crear perfil según rol actual
        if ($user->rol === 'vendedor') {
            $profile = PerfilVendedor::firstOrCreate(['id_usuario' => $user->id]);
            if (array_key_exists('telefono',$data)) $profile->telefono = $data['telefono'];
            if (array_key_exists('zona',$data))     $profile->zona     = $data['zona'];
            $profile->save();
        } elseif ($user->rol === 'cliente') {
            $profile = PerfilCliente::firstOrCreate(['id_usuario' => $user->id]);
            if (array_key_exists('telefono',$data))  $profile->telefono  = $data['telefono'];
            if (array_key_exists('direccion',$data)) $profile->direccion = $data['direccion'];
            $profile->save();
        }

        $user->load(['perfilCliente','perfilVendedor']);

        return response()->json(['message' => 'Usuario actualizado correctamente', 'user' => $user]);
    }

    // 🔹 Eliminar usuario (solo admin; evita borrarse a sí mismo)
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

    // 🔹 Actualizar perfil propio (cliente/vendedor/admin)
    public function updateSelf(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name'     => ['sometimes','string','max:255'],
            'email'    => ['sometimes','email','max:255', Rule::unique('users','email')->ignore($user->id)],
            // perfil vendedor
            'telefono' => ['nullable','string','max:50'],
            'zona'     => ['nullable','string','max:255'],
            // perfil cliente
            'direccion'=> ['nullable','string','max:255'],
        ]);

        if (isset($data['name']))  $user->name  = $data['name'];
        if (isset($data['email'])) $user->email = $data['email'];
        $user->save();

        if ($user->rol === 'vendedor') {
            $profile = PerfilVendedor::firstOrCreate(['id_usuario' => $user->id]);
            if (array_key_exists('telefono',$data)) $profile->telefono = $data['telefono'];
            if (array_key_exists('zona',$data))     $profile->zona     = $data['zona'];
            $profile->save();
        } elseif ($user->rol === 'cliente') {
            $profile = PerfilCliente::firstOrCreate(['id_usuario' => $user->id]);
            if (array_key_exists('telefono',$data))  $profile->telefono  = $data['telefono'];
            if (array_key_exists('direccion',$data)) $profile->direccion = $data['direccion'];
            $profile->save();
        }

        $user->load(['perfilCliente','perfilVendedor']);
        return response()->json(['message' => 'Perfil actualizado', 'user' => $user]);
    }

    // 🔹 Cambiar contraseña (propio)
    public function changePassword(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'current_password' => ['required','string'],
            'password'         => ['required','string','min:6','confirmed'], // requiere password_confirmation
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
        return in_array($rol, ['admin','administrador'], true);
    }

    private function ensureAdmin(Request $r): void
    {
        abort_unless($this->isAdmin($r->user()), 403, 'Solo administradores');
    }
}
