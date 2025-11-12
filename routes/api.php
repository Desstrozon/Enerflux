<?php

use Illuminate\Support\Facades\Route;

// Controllers
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\StripeController;

/*
|--------------------------------------------------------------------------
| API ROUTES
|--------------------------------------------------------------------------
| Aquí definimos todas las rutas de la API. Mantengo exactamente
| los mismos endpoints que ya estás usando, solo ordenados y comentados.
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
Route::get('/productos',       [ProductoController::class, 'index']); // listar (público)
Route::get('/productos/{id}',  [ProductoController::class, 'show']);  // detalle (público)

/* =========================================================
|  ZONA AUTENTICADA (cliente logueado)
|  - Perfil propio
|  - Carrito
|  - Checkout (Stripe)
|  - Pedidos del cliente
========================================================= */
Route::middleware('auth:sanctum')->group(function () {
    // ---- Perfil propio ----
    Route::get('/me', fn(\Illuminate\Http\Request $r) => $r->user());
    Route::put('/me', [\App\Http\Controllers\Api\UserController::class, 'updateSelf']);
    Route::put('/me/password', [\App\Http\Controllers\Api\UserController::class, 'changePassword']);

    // ---- Carrito ----
    Route::get('/cart',          [CartController::class, 'show']);
    Route::post('/cart/add',     [CartController::class, 'add']);
    Route::post('/cart/update',  [CartController::class, 'updateQty']);
    Route::post('/cart/remove',  [CartController::class, 'remove']);
    Route::post('/cart/clear',   [CartController::class, 'clear']);
    Route::post('/cart/sync',    [CartController::class, 'sync']);

    // ---- Checkout (Stripe) ----
    Route::post('/checkout/sessions', [StripeController::class, 'createCheckoutSession']);

    // ---- Pedidos del cliente ----
    Route::get('/orders/by-session/{session}', [OrderController::class, 'showBySession']); // usado en pantalla de éxito
    Route::get('/orders/mine', [OrderController::class, 'index']);
    Route::get('/orders/{order}/invoice',     [OrderController::class, 'invoiceHtml']);
    Route::get('/orders/{order}/invoice.pdf', [OrderController::class, 'invoicePdf']);
});

/* =========================================================
|  ZONA ADMIN (requiere auth + rol admin)
|  - Gestión de usuarios
|  - CRUD de productos (crear/editar/eliminar)
|  * OJO: no re-declaramos GET /productos para no pisar las públicas
========================================================= */
Route::middleware([
    'auth:sanctum',
    \App\Http\Middleware\EnsureRole::class, // debe validar admin
])->group(function () {
    // Usuarios
    Route::get('/users',         [\App\Http\Controllers\Api\UserController::class, 'index']);
    Route::post('/users',        [\App\Http\Controllers\Api\UserController::class, 'store']);   // crear
    Route::get('/vendedores',    [\App\Http\Controllers\Api\UserController::class, 'vendedores']);
    Route::put('/users/{id}',    [\App\Http\Controllers\Api\UserController::class, 'update']);
    Route::delete('/users/{id}', [\App\Http\Controllers\Api\UserController::class, 'destroy']);

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
