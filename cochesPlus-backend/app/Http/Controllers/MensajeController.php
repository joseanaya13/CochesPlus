<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Conversacion;
use App\Models\Mensaje;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MensajeController extends Controller
{
    /**
     * Obtener mensajes de una conversación
     */
    public function index($conversacionId)
    {
        $user = Auth::user();

        // Verificar que el usuario tiene acceso a esta conversación
        $conversacion = Conversacion::where('id', $conversacionId)
            ->where(function ($query) use ($user) {
                $query->where('id_comprador', $user->id)
                    ->orWhere('id_vendedor', $user->id);
            })
            ->firstOrFail();

        $mensajes = Mensaje::with('remitente:id,nombre')
            ->where('id_conversacion', $conversacionId)
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        return response()->json($mensajes);
    }

    /**
     * Enviar un nuevo mensaje
     */
    public function store(Request $request, $conversacionId)
    {
        $request->validate([
            'contenido' => 'required|string|max:1000'
        ]);

        $user = Auth::user();

        // Verificar que el usuario tiene acceso a esta conversación
        $conversacion = Conversacion::where('id', $conversacionId)
            ->where(function ($query) use ($user) {
                $query->where('id_comprador', $user->id)
                    ->orWhere('id_vendedor', $user->id);
            })
            ->firstOrFail();

        // Crear el mensaje
        $mensaje = Mensaje::create([
            'id_conversacion' => $conversacionId,
            'id_remitente' => $user->id,
            'contenido' => $request->contenido,
            'leido' => false
        ]);

        // Cargar la relación del remitente
        $mensaje->load('remitente:id,nombre');

        // Actualizar timestamp de la conversación
        $conversacion->touch();

        // Disparar evento para broadcast
        broadcast(new MessageSent($mensaje))->toOthers();

        return response()->json($mensaje, 201);
    }

    /**
     * Marcar mensaje como leído
     */
    public function markAsRead($conversacionId, $mensajeId)
    {
        $user = Auth::user();

        // Verificar acceso a la conversación
        $conversacion = Conversacion::where('id', $conversacionId)
            ->where(function ($query) use ($user) {
                $query->where('id_comprador', $user->id)
                    ->orWhere('id_vendedor', $user->id);
            })
            ->firstOrFail();

        // Marcar mensaje como leído (solo si no es el remitente)
        $mensaje = Mensaje::where('id', $mensajeId)
            ->where('id_conversacion', $conversacionId)
            ->where('id_remitente', '!=', $user->id)
            ->firstOrFail();

        $mensaje->update(['leido' => true]);

        return response()->json(['message' => 'Mensaje marcado como leído']);
    }

    /**
     * Marcar todos los mensajes de una conversación como leídos
     */
    public function markAllAsRead($conversacionId)
    {
        $user = Auth::user();

        // Verificar acceso a la conversación
        $conversacion = Conversacion::where('id', $conversacionId)
            ->where(function ($query) use ($user) {
                $query->where('id_comprador', $user->id)
                    ->orWhere('id_vendedor', $user->id);
            })
            ->firstOrFail();

        // Marcar todos los mensajes no leídos como leídos
        Mensaje::where('id_conversacion', $conversacionId)
            ->where('id_remitente', '!=', $user->id)
            ->where('leido', false)
            ->update(['leido' => true]);

        return response()->json(['message' => 'Todos los mensajes marcados como leídos']);
    }
}
