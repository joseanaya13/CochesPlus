<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;
use App\Models\Conversacion;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    Log::info('Autorizando canal de usuario', [
        'user_id' => $user->id,
        'requested_id' => $id,
        'authorized' => (int) $user->id === (int) $id
    ]);

    return (int) $user->id === (int) $id;
});

// Canal privado para conversaciones
Broadcast::channel('conversacion.{conversacionId}', function ($user, $conversacionId) {
    Log::info('Autorizando canal de conversación', [
        'user_id' => $user->id,
        'conversacion_id' => $conversacionId
    ]);

    $conversacion = Conversacion::find($conversacionId);

    if (!$conversacion) {
        Log::warning('Conversación no encontrada', [
            'conversacion_id' => $conversacionId,
            'user_id' => $user->id
        ]);
        return false;
    }

    // Solo permitir acceso si el usuario es el comprador o el vendedor
    $authorized = $user->id === $conversacion->id_comprador || $user->id === $conversacion->id_vendedor;

    Log::info('Resultado de autorización de conversación', [
        'user_id' => $user->id,
        'conversacion_id' => $conversacionId,
        'comprador_id' => $conversacion->id_comprador,
        'vendedor_id' => $conversacion->id_vendedor,
        'authorized' => $authorized
    ]);

    return $authorized;
});
