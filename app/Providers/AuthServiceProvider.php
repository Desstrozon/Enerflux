<?php

namespace App\Providers;

use App\Models\Producto;
use App\Policies\ProductoPolicy;
use App\Models\Order;
use App\Policies\OrderPolicy;
use App\Models\User;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
    \App\Models\User::class     => \App\Policies\UserPolicy::class,
    \App\Models\Producto::class => \App\Policies\ProductoPolicy::class,
    \App\Models\Order::class    => \App\Policies\OrderPolicy::class,
];


    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
        // Aquí podrías definir Gates si los necesitas
    }
}
