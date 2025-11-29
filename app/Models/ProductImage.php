<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    protected $table = 'product_images';

    protected $fillable = [
        'producto_id',
        'path',
        'sort_order',
    ];

    // 
    protected $appends = ['url'];
    
    protected $hidden = ['path', 'updated_at', 'created_at'];
    protected $casts = [
        'sort_order' => 'integer',
        'producto_id' => 'integer',
    ];

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id', 'id_producto');
    }

    //  Accesor que construye la URL pública desde storage
    public function getUrlAttribute(): string
    {
        $path = ltrim((string)$this->path, '/');
        return url('storage/' . $path);
    }
}
