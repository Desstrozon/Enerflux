<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};
use Illuminate\Support\Facades\DB;

class Cart extends Model
{
    protected $table = 'carts';

    protected $fillable = [
        'user_id',
        'status',     // active|ordered|abandoned
        'currency',   // EUR por defecto
        'subtotal',
        'total',
    ];

    // 👇 Casts: en Laravel, decimal:N devuelve string; usa float si prefieres número JS-like
    protected $casts = [
        'subtotal' => 'float',
        'total'    => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /* --------------------------
       Scopes útiles
    -------------------------- */
    public function scopeActive($q)
    {
        return $q->where('status', 'active');
    }

    public function scopeForUser($q, $userId)
    {
        return $q->where('user_id', $userId);
    }

    /* ------------------------------------------------
       Obtener o crear el carrito ACTIVO del usuario
       (controlado por código, no por unique en BD)
    ------------------------------------------------- */
    public static function getActiveFor($user)
    {
        return static::firstOrCreate(
            ['user_id' => $user->id, 'status' => 'active'],
            ['currency' => 'EUR', 'subtotal' => 0, 'total' => 0]
        );
    }

    /* ------------------------------------------------
       Recalcular totales: usa SUM en SQL (sin cargar colección)
    ------------------------------------------------- */
    public function recalcTotals(): void
    {
        $subtotal = (float) $this->items()
            ->select(DB::raw('COALESCE(SUM(quantity * unit_price), 0) as sub'))
            ->value('sub');

        $this->subtotal = $subtotal;
        $this->total    = $subtotal; // aquí aplicarás impuestos/envío/discounts
        $this->save();
    }

    /* ------------------------------------------------
       Recalcular con bloqueo (opcional, si luego manejas stock
       o quieres coherencia fuerte en escenarios concurridos)
    ------------------------------------------------- */
    public function recalcTotalsWithLock(): void
    {
        DB::transaction(function () {
            // bloquea las filas de items de este carrito
            $subtotal = (float) $this->items()
                ->lockForUpdate()
                ->select(DB::raw('COALESCE(SUM(quantity * unit_price), 0) as sub'))
                ->value('sub');

            $this->subtotal = $subtotal;
            $this->total    = $subtotal;
            $this->save();
        });
    }

    /* ------------------------------------------------
       (Opcional) Contador de líneas para enseñar en UI
    ------------------------------------------------- */
    protected $appends = ['items_count'];

    public function getItemsCountAttribute(): int
    {
        // cuenta líneas, no unidades: usa SUM(quantity) si quieres unidades
        return (int) $this->items()->count('id');
    }
}
