<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inversor extends Model
{
    use HasFactory;

    protected $table = 'inversores';
    protected $primaryKey = 'id_inversor';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'id_producto',
        'modelo',
        'potencia_nominal',
        'eficiencia',
        'tipo',
    ];

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto', 'id_producto');
    }

    protected $casts = [
        'potencia_nominal' => 'float',
        'eficiencia'       => 'float',
    ];
}
