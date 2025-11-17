<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    use HasFactory;

    protected $table = 'productos';
    protected $primaryKey = 'id_producto';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'nombre',
        'descripcion',
        'categoria',
        'precio_base',
        'stock',
        'id_vendedor',
        'imagen',
    ];

    // Relación con vendedor (User)
    public function vendedor()
    {
        return $this->belongsTo(User::class, 'id_vendedor');
    }
    protected $casts = [
        'precio_base' => 'float',
        'stock'       => 'int',
    ];
}
