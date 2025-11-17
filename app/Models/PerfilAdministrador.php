<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerfilAdministrador extends Model
{
    protected $table = 'perfil_administrador';
    protected $primaryKey = 'id_usuario';
    public $incrementing = false;
    protected $keyType = 'int';
    protected $fillable = ['id_usuario', 'telefono', 'departamento'];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_usuario');
    }
}
