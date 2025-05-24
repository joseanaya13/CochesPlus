<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Broadcast;

class BroadcastingAuthController extends Controller
{
    /**
     * Maneja la autorización de canales de broadcasting
     */
    public function authenticate(Request $request)
    {
        try {
            // Laravel maneja automáticamente la autenticación
            return Broadcast::auth($request);
        } catch (\Exception $e) {
            Log::error('Error en autenticación de broadcasting', [
                'error' => $e->getMessage(),
                'user' => $request->user() ? $request->user()->id : 'no_user',
                'channel' => $request->get('channel_name')
            ]);

            return response()->json([
                'error' => 'Authorization failed',
                'message' => $e->getMessage()
            ], 403);
        }
    }
}
