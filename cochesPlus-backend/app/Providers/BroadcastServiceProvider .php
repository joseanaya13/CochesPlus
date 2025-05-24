<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Configurar las rutas de broadcasting con middleware de autenticación
        Broadcast::routes([
            'middleware' => ['auth:sanctum']
        ]);

        require base_path('routes/channels.php');
    }
}
