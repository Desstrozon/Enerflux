<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/frontend/');
})->name('inicio');

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');
});

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

// Catch-all para React Router
Route::get('/frontend/{any?}', function () {
    \Log::info('Frontend catch-all ejecutado', ['path' => request()->path(), 'url' => request()->fullUrl()]);
    $indexPath = base_path('frontend/index.html');
    if (file_exists($indexPath)) {
        return response()->file($indexPath);
    }
    \Log::error('Frontend index.html no encontrado', ['path' => $indexPath]);
    abort(404, 'Frontend not found');
})->where('any', '.*');
