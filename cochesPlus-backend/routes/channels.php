<?php

use Illuminate\Support\Facades\Broadcast;
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
    return (int) $user->id === (int) $id;
});

// Canal privado para conversaciones
Broadcast::channel('conversacion.{conversacionId}', function ($user, $conversacionId) {
    $conversacion = Conversacion::find($conversacionId);

    if (!$conversacion) {
        return false;
    }

    // Solo permitir acceso si el usuario es el comprador o el vendedor
    return $user->id === $conversacion->id_comprador || $user->id === $conversacion->id_vendedor;
});
