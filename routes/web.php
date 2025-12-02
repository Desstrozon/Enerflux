<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $path = public_path('frontend/index.html');
    if (!file_exists($path)) {
        abort(404, 'Frontend index.html not found');
    }
    return response()->file($path);
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
