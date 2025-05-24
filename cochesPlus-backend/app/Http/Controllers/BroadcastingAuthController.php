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
            Log::info('Broadcasting authentication request', [
                'user_id' => $request->user() ? $request->user()->id : 'no_user',
                'channel' => $request->get('channel_name'),
                'socket_id' => $request->get('socket_id'),
                'headers' => $request->headers->all(),
            ]);

            // Validar que el usuario esté autenticado
            if (!$request->user()) {
                Log::warning('Usuario no autenticado intentando acceder a broadcasting');
                return response()->json([
                    'error' => 'Unauthenticated'
                ], 401);
            }

            // Validar parámetros requeridos
            if (!$request->has('channel_name') || !$request->has('socket_id')) {
                Log::warning('Parámetros faltantes en request de broadcasting');
                return response()->json([
                    'error' => 'Missing required parameters'
                ], 400);
            }

            // Laravel maneja automáticamente la autenticación
            $authData = Broadcast::auth($request);

            Log::info('Broadcasting authentication successful', [
                'user_id' => $request->user()->id,
                'channel' => $request->get('channel_name'),
            ]);

            return response()->json($authData);
        } catch (\Exception $e) {
            Log::error('Error en autenticación de broadcasting', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user' => $request->user() ? $request->user()->id : 'no_user',
                'channel' => $request->get('channel_name'),
                'socket_id' => $request->get('socket_id'),
            ]);

            return response()->json([
                'error' => 'Authorization failed',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 403);
        }
    }
}
