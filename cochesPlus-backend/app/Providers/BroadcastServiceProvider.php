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
        // No usar Broadcast::routes() aquí porque ya tenemos las rutas en api.php

        require base_path('routes/channels.php');
    }
}
