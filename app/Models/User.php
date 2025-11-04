<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
// use Laravel\Jetstream\HasProfilePhoto;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasOne;


class User extends Authenticatable
{
    use HasApiTokens;

    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory;
    //  use HasProfilePhoto;
    use Notifiable;
    use TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = ['name', 'email', 'password', 'rol'];


    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    /* protected $appends = [
        'profile_photo_url',
    ]; */

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function perfilAdministrador(): HasOne
    {
        return $this->hasOne(PerfilAdministrador::class, 'id_usuario');
    }
    public function perfilVendedor(): HasOne
    {
        return $this->hasOne(PerfilVendedor::class, 'id_usuario');
    }
    public function perfilCliente(): HasOne
    {
        return $this->hasOne(PerfilCliente::class, 'id_usuario');
    }

    // Helper rápido para chequear rol
    public function isAdmin(): bool
    {
        return in_array(strtolower($this->rol ?? ''), ['admin', 'administrador'], true);
    }

    
    public function cart()
    {
        // si solo quieres 1 activo:
        return $this->hasOne(\App\Models\Cart::class)->where('status', 'active');
    }
    // si quieres poder acceder a históricos:
    // public function carts() { return $this->hasMany(Cart::class); }


}
