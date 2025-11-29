<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerfilCliente extends Model
{

    protected $table = 'perfil_cliente';
    protected $primaryKey = 'id_usuario';
    public $incrementing = false;
    protected $keyType = 'int';
   
    protected $fillable = [
        'id_usuario',
        'telefono',
        'direccion',      // legacy 
        'address_line1',
        'address_line2',
        'city',
        'province',
        'postal_code',
        'country',
    ];

    public $timestamps = false; // Desactivar timestamps si no se usan


    public function user()
    {
        return $this->belongsTo(User::class, 'id_usuario');
    }
}
