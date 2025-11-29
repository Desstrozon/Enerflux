<?php


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

//  importa tus Mailables
use App\Mail\VendorApprovedMail;
use App\Mail\VendorRejectedMail;

class VendorApprovalController extends Controller
{
    public function index()
    {
        // lista “pendientes” con perfil si existe
        $q = \App\Models\User::query()
            ->where('rol', 'vendedor')
            ->where('vendor_status', 'pending')
            ->leftJoin('perfil_vendedores as pv', 'pv.id_usuario', '=', 'users.id')
            ->select('users.*', 'pv.telefono', 'pv.zona');

        return response()->json($q->orderBy('users.created_at', 'desc')->get());
    }

    public function approve(Request $request, User $user)
    {
        $this->ensureAdmin($request);

        if (strtolower($user->rol ?? '') !== 'vendedor') {
            return response()->json(['message' => 'El usuario no es vendedor'], 422);
        }

        $note = $request->input('note'); 

        $user->vendor_status = 'approved';
        $user->vendor_note  = $note;
        $user->save();

        //  ENVÍA EL CORREO
        Mail::to($user->email)->send(new VendorApprovedMail($user, $note));

        return response()->json(['message' => 'Vendedor aprobado']);
    }

    //  Rechazar vendedor
    public function reject(Request $request, User $user)
    {
        $this->ensureAdmin($request);

        if (strtolower($user->rol ?? '') !== 'vendedor') {
            return response()->json(['message' => 'El usuario no es vendedor'], 422);
        }

        $reason = $request->input('notes'); // nombre del campo que mandas desde el front

        $user->vendor_status = 'rejected';
        $user->vendor_note  = $reason;
        $user->save();

        //  ENVÍA EL CORREO
        Mail::to($user->email)->send(new VendorRejectedMail($user, $reason));

        return response()->json(['message' => 'Vendedor rechazado']);
    }

    // --- helper ---
    private function ensureAdmin(Request $r): void
    {
        $u   = $r->user();
        $rol = strtolower($u->rol ?? '');
        abort_unless(in_array($rol, ['admin', 'administrador'], true), 403, 'Solo administradores');
    }
}
