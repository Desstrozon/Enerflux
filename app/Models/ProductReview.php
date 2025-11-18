<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductReview extends Model
{
    protected $fillable = [
        'producto_id','user_id','rating','comment','likes','dislikes'
    ];

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id', 'id_producto');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
