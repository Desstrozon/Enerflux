<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\CartController;

// ==========================
//  AUTENTICACIÓN
// ==========================
Route::post('/login',  [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::post('/register', [RegisterController::class, 'store']);

// -----------------------------
//  Rutas PÚBLICAS de productos
// -----------------------------
// => El cliente TIENE que poder listar/ver sin autenticarse
Route::get('/productos', [ProductoController::class, 'index']);     // listar (público)
Route::get('/productos/{id}', [ProductoController::class, 'show']); // detalle (público)

// ==========================
//  Carrito (usuario autenticado)
// ==========================
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/cart', [CartController::class, 'show']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::post('/cart/update', [CartController::class, 'updateQty']);
    Route::post('/cart/remove', [CartController::class, 'remove']);
    Route::post('/cart/clear', [CartController::class, 'clear']);
    Route::post('/cart/sync', [CartController::class, 'sync']);
});

// ==========================
//  RUTAS SOLO ADMIN
// ==========================
//  aquí NO redeclaramos GET /productos para no pisar las públicas
Route::middleware([
    'auth:sanctum',
    \App\Http\Middleware\EnsureRole::class, // debe validar admin
])->group(function () {
    // Gestión de usuarios
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/vendedores', [UserController::class, 'vendedores']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // CRUD de productos SOLO para admin (sin GET index/show aquí)
    Route::post('/productos', [ProductoController::class, 'store']);
    Route::put('/productos/{id}', [ProductoController::class, 'update']);
    Route::delete('/productos/{id}', [ProductoController::class, 'destroy']);
});
