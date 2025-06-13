<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CocheController;
use App\Http\Controllers\MarcaController;
use App\Http\Controllers\CompraController;
use App\Http\Controllers\MensajeController;
use App\Http\Controllers\FavoritoController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ProvinciaController;
use App\Http\Controllers\ValoracionController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Auth\ProfileController;
use App\Http\Controllers\ConversacionController;
use App\Http\Controllers\Admin\AdminAdsController;
use App\Http\Controllers\Admin\AdminUsersController;
use App\Http\Controllers\BroadcastingAuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Admin\AdminMessagesController;

// ==================== RUTAS PÚBLICAS (INVITADOS) ====================
// Rutas de autenticación
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);

// Rutas públicas de consulta
Route::get('/marcas', [MarcaController::class, 'index']);
Route::get('/marcas/{id}', [MarcaController::class, 'show']);
Route::get('/marcas/{id}/modelos', [MarcaController::class, 'getModelos']);
Route::get('/categorias', [CategoriaController::class, 'index']);
Route::get('/categorias/{id}', [CategoriaController::class, 'show']);
Route::get('/provincias', [ProvinciaController::class, 'index']);
Route::get('/provincias/{id}', [ProvinciaController::class, 'show']);
Route::get('/coches', [CocheController::class, 'index']);
Route::get('/coche/{id}', [CocheController::class, 'show']);
Route::get('/vendedores/{vendedorId}/valoraciones', [ValoracionController::class, 'getValoracionesVendedor']);

// ==================== RUTAS PARA USUARIOS AUTENTICADOS ====================
Route::middleware(['auth:sanctum'])->group(function () {
    // Autenticación
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/verify-role/{role}', [AuthController::class, 'verifyRole']);
    Route::post('/broadcasting/auth', [BroadcastingAuthController::class, 'authenticate']);

    // Perfil de usuario
    Route::get('/profile', [ProfileController::class, 'getProfile']);
    Route::put('/profile', [ProfileController::class, 'updateProfile']);
    Route::put('/profile/password', [ProfileController::class, 'changePassword']);

    // ======= RUTAS PARA COMPRADORES Y VENDEDORES =======
    Route::middleware('role_or_ability:comprador,vendedor')->group(function () {
        // Favoritos
        Route::get('/user/favoritos', [FavoritoController::class, 'getUserFavorites']);
        Route::post('/user/favoritos', [FavoritoController::class, 'addFavorite']);
        Route::get('/user/favoritos/{cocheId}', [FavoritoController::class, 'checkFavorite']);
        Route::delete('/user/favoritos/{cocheId}', [FavoritoController::class, 'removeFavorite']);

        // Conversaciones y mensajes
        Route::prefix('conversaciones')->group(function () {
            Route::get('/', [ConversacionController::class, 'index']);
            Route::post('/', [ConversacionController::class, 'store']);
            Route::get('/{id}', [ConversacionController::class, 'show']);
            Route::delete('/{id}', [ConversacionController::class, 'destroy']);
            Route::get('/{conversacionId}/mensajes', [MensajeController::class, 'index']);
            Route::post('/{conversacionId}/mensajes', [MensajeController::class, 'store']);
            Route::put('/{conversacionId}/mensajes/{mensajeId}/leido', [MensajeController::class, 'markAsRead']);
            Route::put('/{conversacionId}/mensajes/leer-todos', [MensajeController::class, 'markAllAsRead']);
        });

        // Valoraciones
        Route::post('/valoraciones', [ValoracionController::class, 'store']);
        Route::put('/valoraciones/{id}', [ValoracionController::class, 'update']);
        Route::delete('/valoraciones/{id}', [ValoracionController::class, 'destroy']);
        Route::get('/user/compras-sin-valorar', [ValoracionController::class, 'getComprasSinValorar']);
        Route::get('/user/valoraciones-realizadas', [ValoracionController::class, 'getValoracionesRealizadas']);

        // Compras
        Route::post('/compras', [CompraController::class, 'iniciarCompra']);
        Route::put('/compras/{id}/responder-vendedor', [CompraController::class, 'responderVendedor']);
        Route::put('/compras/{id}/confirmar-comprador', [CompraController::class, 'confirmarComprador']);
        Route::get('/compras/mis-compras', [CompraController::class, 'misCompras']);
        Route::get('/compras/mis-ventas', [CompraController::class, 'misVentas']);
        Route::delete('/compras/{id}', [CompraController::class, 'cancelar']);
    });

    // ======= RUTAS ESPECÍFICAS PARA VENDEDORES =======
    Route::middleware('role_or_ability:vendedor')->group(function () {
        Route::post('/coches', [CocheController::class, 'store']);
        Route::put('/coches/{id}', [CocheController::class, 'update']);
        Route::delete('/coche/{id}', [CocheController::class, 'destroy']);
        Route::get('/user/coches', [CocheController::class, 'getUserCars']);
        Route::get('/user/estadisticas-vendedor', [ValoracionController::class, 'getEstadisticasVendedor']);

        // Gestión de imágenes y documentos
        Route::post('/coches/{id}/imagenes', [CocheController::class, 'addImage']);
        Route::delete('/coches/{id}/imagenes/{imagenId}', [CocheController::class, 'removeImage']);
        Route::post('/coches/{id}/documentos', [CocheController::class, 'addDocument']);
        Route::delete('/coches/{id}/documentos/{documentoId}', [CocheController::class, 'removeDocument']);
    });

    // ==================== RUTAS PARA ADMINISTRADORES ====================
    Route::middleware('role_or_ability:admin')->prefix('admin')->group(function () {
        // Panel de control principal
        Route::get('/dashboard', [AdminController::class, 'panelControl']);

        // Verificación de coches
        Route::put('/coches/{id}/verificar', [CocheController::class, 'verificarCoche']);

        // Gestión de usuarios
        Route::prefix('users')->group(function () {
            Route::get('/', [AdminUsersController::class, 'listar']);
            Route::get('/{id}', [AdminUsersController::class, 'mostrar']);
            Route::post('/', [AdminUsersController::class, 'crear']);
            Route::put('/{id}', [AdminUsersController::class, 'actualizar']);
            Route::delete('/{id}', [AdminUsersController::class, 'eliminar']);
        });

        // Gestión de anuncios
        Route::prefix('ads')->group(function () {
            Route::get('/', [AdminAdsController::class, 'listar']);
            Route::get('/{id}', [AdminAdsController::class, 'mostrar']);
            Route::put('/{id}', [AdminAdsController::class, 'actualizar']);
            Route::delete('/{id}', [AdminAdsController::class, 'eliminar']);
            Route::post('/{id}/feature', [AdminAdsController::class, 'destacar']);
        });

        // Gestión de mensajes y conversaciones
        Route::prefix('messages')->group(function () {
            Route::get('/', [AdminMessagesController::class, 'listar']);
            Route::get('/{id}', [AdminMessagesController::class, 'mostrar']);
            Route::delete('/{id}', [AdminMessagesController::class, 'eliminar']);
        });

        Route::prefix('conversations')->group(function () {
            Route::get('/', [AdminMessagesController::class, 'conversaciones']);
            Route::get('/{id}/messages', [AdminMessagesController::class, 'mensajesConversacion']);
            Route::post('/{id}/close', [AdminMessagesController::class, 'cerrarConversacion']);
        });

        // Gestión de marcas y categorías (operaciones de escritura)
        Route::post('/marcas', [MarcaController::class, 'store']);
        Route::put('/marcas/{id}', [MarcaController::class, 'update']);
        Route::delete('/marcas/{id}', [MarcaController::class, 'destroy']);
        Route::post('/categorias', [CategoriaController::class, 'store']);
        Route::put('/categorias/{id}', [CategoriaController::class, 'update']);
        Route::delete('/categorias/{id}', [CategoriaController::class, 'destroy']);
    });
});
