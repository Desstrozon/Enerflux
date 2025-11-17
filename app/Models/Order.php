<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'stripe_session_id',
        'stripe_payment_intent_id',
        'status',
        'currency',
        'amount',
        'billing_snapshot',
        'metadata',
    ];

    //Muy importante: castear decimales a float
    protected $casts = [
        'amount' => 'float',
        'billing_snapshot' => 'array',
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
