<?php



namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerfilVendedor extends Model
{
    protected $table = 'perfil_vendedor';
    protected $primaryKey = 'id_usuario';
    public $incrementing = false;
    protected $keyType = 'int';
    protected $fillable = ['id_usuario', 'telefono', 'zona'];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_usuario');
    }
}
