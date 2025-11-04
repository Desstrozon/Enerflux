<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    protected $table = 'cart_items';

    protected $fillable = [
        'cart_id',
        'producto_id',
        'quantity',
        'unit_price',
        'name_snapshot',
        'image_snapshot',
    ];

    // Mantén updated_at del carrito cuando cambien sus items
    protected $touches = ['cart'];

    // Tipado cómodo para el frontend
    protected $casts = [
        'quantity'   => 'int',
        'unit_price' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relaciones
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    // Ojo: Producto usa PK 'id_producto'
    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id', 'id_producto');
    }

    // Total de la línea (cantidad * precio)
    protected $appends = ['line_total'];

    public function getLineTotalAttribute(): float
    {
        return (float) (($this->quantity ?? 0) * ($this->unit_price ?? 0));
    }

    // Scopes útiles
    public function scopeForCart($q, int $cartId)
    {
        return $q->where('cart_id', $cartId);
    }

    public function scopeForProduct($q, int $productoId)
    {
        return $q->where('producto_id', $productoId);
    }

    /**
     * Recalcula los totales del carrito automáticamente
     * cuando se guardan o eliminan items.
     * (Ya usas transacciones en el controller, así que es seguro.)
     */
    protected static function booted(): void
    {
        $recalc = function (CartItem $item): void {
            // Evita N+1: solo si el carrito está cargado o puede cargarse
            if ($item->relationLoaded('cart')) {
                $item->cart?->recalcTotals();
            } else {
                $cart = $item->cart()->first();
                $cart?->recalcTotals();
            }
        };

        static::saved($recalc);
        static::deleted($recalc);
    }
}
