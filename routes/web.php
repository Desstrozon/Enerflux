<?php

use Illuminate\Support\Facades\Route;

// Rutas específicas de Laravel que NO deben ir al frontend
Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');
});

// Servir archivos de storage
Route::get('/storage/{path}', function ($path) {
    $file = storage_path('app/public/' . $path);
    if (!file_exists($file)) {
        abort(404);
    }
    return response()->file($file);
})->where('path', '.*');

// Servir archivos estáticos de frontend (CSS, JS, imágenes)
Route::get('/frontend/assets/{path}', function ($path) {
    $file = base_path('frontend/assets/' . $path);
    if (file_exists($file)) {
        return response()->file($file);
    }
    abort(404);
})->where('path', '.*');

// IMPORTANTE: Esta ruta debe ir AL FINAL
// Sirve el index.html para TODAS las demás rutas (SPA routing)
Route::fallback(function () {
    $indexPath = base_path('frontend/index.html');
    if (file_exists($indexPath)) {
        return response()->file($indexPath);
    }
    abort(404, 'Frontend not found');
});
