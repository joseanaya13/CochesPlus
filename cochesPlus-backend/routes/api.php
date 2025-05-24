<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CocheController;
use App\Http\Controllers\MarcaController;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\MensajeController;
use App\Http\Controllers\FavoritoController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ProvinciaController;
use App\Http\Controllers\Auth\ProfileController;
use App\Http\Controllers\ConversacionController;
use App\Http\Controllers\BroadcastingAuthController;
use App\Http\Controllers\Auth\PasswordResetController;

// Rutas de autenticación
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Rutas de perfil
    Route::get('/profile', [ProfileController::class, 'getProfile']);
    Route::put('/profile', [ProfileController::class, 'updateProfile']);
    Route::put('/profile/password', [ProfileController::class, 'changePassword']);
});

// Rutas de marcas
Route::get('/marcas', [MarcaController::class, 'index']);
Route::get('/marcas/{id}', [MarcaController::class, 'show']);
Route::get('/marcas/{id}/modelos', [MarcaController::class, 'getModelos']);

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::post('/marcas', [MarcaController::class, 'store']);
    Route::put('/marcas/{id}', [MarcaController::class, 'update']);
    Route::delete('/marcas/{id}', [MarcaController::class, 'destroy']);
});

// Rutas de categorías
Route::get('/categorias', [CategoriaController::class, 'index']);
Route::get('/categorias/{id}', [CategoriaController::class, 'show']);

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::post('/categorias', [CategoriaController::class, 'store']);
    Route::put('/categorias/{id}', [CategoriaController::class, 'update']);
    Route::delete('/categorias/{id}', [CategoriaController::class, 'destroy']);
});

// Rutas de provincias
Route::get('/provincias', [ProvinciaController::class, 'index']);
Route::get('/provincias/{id}', [ProvinciaController::class, 'show']);

// Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
//     Route::post('/provincias', [ProvinciaController::class, 'store']);
//     Route::put('/provincias/{id}', [ProvinciaController::class, 'update']);
//     Route::delete('/provincias/{id}', [ProvinciaController::class, 'destroy']);
// });

// Rutas de coches
Route::get('/coches', [CocheController::class, 'index']);
Route::get('/coche/{id}', [CocheController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/coches', [CocheController::class, 'store']);
    Route::put('/coches/{id}', [CocheController::class, 'update']);
    Route::delete('/coche/{id}', [CocheController::class, 'destroy']);
    Route::get('/user/coches', [CocheController::class, 'getUserCars']);

    // Gestión de imágenes y documentos de coches
    Route::post('/coches/{id}/imagenes', [CocheController::class, 'addImage']);
    Route::delete('/coches/{id}/imagenes/{imagenId}', [CocheController::class, 'removeImage']);
    Route::post('/coches/{id}/documentos', [CocheController::class, 'addDocument']);
    Route::delete('/coches/{id}/documentos/{documentoId}', [CocheController::class, 'removeDocument']);
});

// Rutas de favoritos
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/favoritos', [FavoritoController::class, 'getUserFavorites']);
    Route::post('/user/favoritos', [FavoritoController::class, 'addFavorite']);
    Route::get('/user/favoritos/{cocheId}', [FavoritoController::class, 'checkFavorite']);
    Route::delete('/user/favoritos/{cocheId}', [FavoritoController::class, 'removeFavorite']);
});

// Rutas protegidas por autenticación
Route::middleware('auth:sanctum')->group(function () {
    // ... rutas existentes ...

    // Rutas de conversaciones y mensajes
    Route::prefix('conversaciones')->group(function () {
        // Gestión de conversaciones
        Route::get('/', [ConversacionController::class, 'index']);
        Route::post('/', [ConversacionController::class, 'store']);
        Route::get('/{id}', [ConversacionController::class, 'show']);
        Route::delete('/{id}', [ConversacionController::class, 'destroy']);

        // Gestión de mensajes dentro de conversaciones
        Route::get('/{conversacionId}/mensajes', [MensajeController::class, 'index']);
        Route::post('/{conversacionId}/mensajes', [MensajeController::class, 'store']);
        Route::put('/{conversacionId}/mensajes/{mensajeId}/leido', [MensajeController::class, 'markAsRead']);
        Route::put('/{conversacionId}/mensajes/leer-todos', [MensajeController::class, 'markAllAsRead']);
    });

    // Ruta para autorización de broadcasting
    Route::post('/broadcasting/auth', [BroadcastingAuthController::class, 'authenticate']);
});