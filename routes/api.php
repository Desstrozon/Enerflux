<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

// Controllers
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\StripeController;
use App\Http\Controllers\Api\UserController; // 👈 añadido

/*
|--------------------------------------------------------------------------
| API ROUTES
|--------------------------------------------------------------------------
| Aquí definimos todas las rutas de la API.
*/

/* =========================================================
|  AUTENTICACIÓN (público)
|  - Login / Logout / Registro
========================================================= */
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/logout',   [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::post('/register', [RegisterController::class, 'store']);

/* =========================================================
|  PRODUCTOS (público)
|  - Listado y detalle visibles sin autenticación
========================================================= */
Route::get('/productos',      [ProductoController::class, 'index']); // listar (público)
Route::get('/productos/{id}', [ProductoController::class, 'show'])->whereNumber('id'); // detalle (público)

/* =========================================================
|  ZONA AUTENTICADA (cliente logueado)
|  - Perfil propio
|  - Carrito
|  - Checkout (Stripe)
|  - Pedidos del cliente
========================================================= */
Route::middleware('auth:sanctum')->group(function () {
    // ---- Perfil propio ----
    Route::get('/me', function (Request $r) {
        return $r->user()->load(['perfilCliente', 'perfilVendedor']);
    });

    // Aliases de compatibilidad
    Route::get('/users/me', function (Request $r) {
        return $r->user()->load(['perfilCliente', 'perfilVendedor']);
    });

    Route::put('/users/me',            [UserController::class, 'updateSelf']);
    Route::put('/users/me/profile',    [UserController::class, 'updateSelf']);
    Route::put('/users/me/password',   [UserController::class, 'changePassword']);

    // Endpoints /me directos
    Route::put('/me',                  [UserController::class, 'updateSelf']);
    Route::put('/me/password',         [UserController::class, 'changePassword']);

    // ---- Carrito ----
    Route::get('/cart',          [CartController::class, 'show']);
    Route::post('/cart/add',     [CartController::class, 'add']);
    Route::post('/cart/update',  [CartController::class, 'updateQty']);
    Route::post('/cart/remove',  [CartController::class, 'remove']);
    Route::post('/cart/clear',   [CartController::class, 'clear']);
    Route::post('/cart/sync',    [CartController::class, 'sync']);
    // ----- notificaciones -----
     Route::get('/notifications', function (\Illuminate\Http\Request $r) {
        return $r->user()->notifications()->latest()->limit(50)->get();
    });

    Route::post('/notifications/{id}/read', function (\Illuminate\Http\Request $r, string $id) {
        $n = $r->user()->notifications()->where('id', $id)->firstOrFail();
        $n->markAsRead();
        return ['ok' => true];
    });

    // ---- Checkout (Stripe) ----
    Route::post('/checkout/sessions', [StripeController::class, 'createCheckoutSession']);

    // ---- Pedidos del cliente ----
    Route::get('/orders/by-session/{session}', [OrderController::class, 'showBySession']); // usado en pantalla de éxito
    Route::get('/orders/mine',                  [OrderController::class, 'index']);
    Route::get('/orders/{order}/invoice',       [OrderController::class, 'invoiceHtml']);
    Route::get('/orders/{order}/invoice.pdf',   [OrderController::class, 'invoicePdf']);
});

/* =========================================================
|  ZONA ADMIN (requiere auth + rol admin)
|  - Gestión de usuarios
|  - CRUD de productos (crear/editar/eliminar)
|  * OJO: no re-declaramos GET /productos para no pisar las públicas
========================================================= */
Route::middleware(['auth:sanctum', \App\Http\Middleware\EnsureRole::class])->group(function () {
    // Usuarios
    Route::get('/users',         [UserController::class, 'index']);
    Route::post('/users',        [UserController::class, 'store']);   // crear
    Route::get('/vendedores',    [UserController::class, 'vendedores']);
    Route::put('/users/{id}',    [UserController::class, 'update'])->whereNumber('id');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->whereNumber('id');

    // Productos (solo admin)
    Route::post('/productos',              [ProductoController::class, 'store']);
    Route::put('/productos/{producto}',    [ProductoController::class, 'update']);
    Route::delete('/productos/{producto}', [ProductoController::class, 'destroy']);
});

/* =========================================================
|  WEBHOOKS STRIPE (público)
|  - Endpoint para eventos de Stripe (checkout.session.completed, etc.)
|  - Test simple para comprobar disponibilidad
========================================================= */
Route::post('/stripe/webhook',      [StripeController::class, 'webhook']); // sin auth
Route::post('/stripe/webhook/test', fn() => response('OK', 200));
