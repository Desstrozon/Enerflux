<?php

use Illuminate\Support\Facades\Route;

// Rutas protegidas de Laravel (dashboard, etc.)
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

// Servir archivos estáticos de frontend
Route::get('/frontend/assets/{path}', function ($path) {
    $file = base_path('frontend/assets/' . $path);
    if (file_exists($file)) {
        return response()->file($file);
    }
    abort(404);
})->where('path', '.*');

// Catch-all para React Router - DEBE IR AL FINAL
// Sirve el index.html del frontend para todas las rutas que no sean API o rutas específicas de Laravel
Route::get('/{any}', function () {
    $indexPath = base_path('frontend/index.html');
    if (file_exists($indexPath)) {
        return response()->file($indexPath);
    }
    abort(404, 'Frontend not found');
})->where('any', '^(?!api|storage|dashboard|frontend/assets).*$');
