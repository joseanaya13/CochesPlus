<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Pusher\Pusher;

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
                'channel' => $request->input('channel_name'),
                'socket_id' => $request->input('socket_id'),
            ]);

            // Validar que el usuario esté autenticado
            if (!$request->user()) {
                Log::warning('Usuario no autenticado intentando acceder a broadcasting');
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            $channelName = $request->input('channel_name');
            $socketId = $request->input('socket_id');

            // Validar parámetros requeridos
            if (!$channelName || !$socketId) {
                Log::warning('Parámetros faltantes en request de broadcasting', [
                    'channel_name' => $channelName,
                    'socket_id' => $socketId
                ]);
                return response()->json(['message' => 'Missing required parameters'], 400);
            }

            // Crear instancia de Pusher
            $pusher = new Pusher(
                config('broadcasting.connections.pusher.key'),
                config('broadcasting.connections.pusher.secret'),
                config('broadcasting.connections.pusher.app_id'),
                [
                    'cluster' => config('broadcasting.connections.pusher.options.cluster'),
                    'encrypted' => true,
                ]
            );

            // Extraer el nombre del canal sin el prefijo private-
            $channelNameWithoutPrefix = str_replace('private-', '', $channelName);

            // Verificar autorización según el tipo de canal
            if (strpos($channelNameWithoutPrefix, 'conversacion.') === 0) {
                // Canal de conversación
                $conversacionId = str_replace('conversacion.', '', $channelNameWithoutPrefix);

                // Verificar que el usuario tenga acceso a esta conversación
                $conversacion = \App\Models\Conversacion::find($conversacionId);

                if (!$conversacion) {
                    Log::warning('Conversación no encontrada', [
                        'conversacion_id' => $conversacionId,
                        'user_id' => $request->user()->id
                    ]);
                    return response()->json(['message' => 'Unauthorized'], 403);
                }

                $userId = $request->user()->id;
                if ($userId !== $conversacion->id_comprador && $userId !== $conversacion->id_vendedor) {
                    Log::warning('Usuario no autorizado para esta conversación', [
                        'user_id' => $userId,
                        'conversacion_id' => $conversacionId,
                        'comprador_id' => $conversacion->id_comprador,
                        'vendedor_id' => $conversacion->id_vendedor
                    ]);
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            } elseif (strpos($channelNameWithoutPrefix, 'App.Models.User.') === 0) {
                // Canal de usuario
                $requestedUserId = str_replace('App.Models.User.', '', $channelNameWithoutPrefix);

                if ($request->user()->id != $requestedUserId) {
                    Log::warning('Usuario no autorizado para este canal de usuario', [
                        'user_id' => $request->user()->id,
                        'requested_user_id' => $requestedUserId
                    ]);
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            }

            // Generar la firma de autenticación
            $auth = $pusher->authorizeChannel($channelName, $socketId);

            Log::info('Broadcasting authentication successful', [
                'user_id' => $request->user()->id,
                'channel' => $channelName,
            ]);

            // Devolver la respuesta en el formato esperado por Pusher
            return response($auth)
                ->header('Content-Type', 'application/json');
        } catch (\Exception $e) {
            Log::error('Error en autenticación de broadcasting', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user' => $request->user() ? $request->user()->id : 'no_user',
                'channel' => $request->input('channel_name'),
                'socket_id' => $request->input('socket_id'),
            ]);

            return response()->json([
                'message' => 'Authorization failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
