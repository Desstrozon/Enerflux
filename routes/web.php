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

// Catch-all para React Router: todas las rutas /frontend/* sirven el index.html
Route::get('/frontend/{any?}', function () {
    $indexPath = public_path('frontend/index.html'); // OJO: archivo, no carpeta

    if (!file_exists($indexPath)) {
        abort(404, 'Frontend index not found');
    }

    return response()->file($indexPath);
})->where('any', '.*');
