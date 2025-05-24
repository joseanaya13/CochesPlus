<?php

namespace App\Http\Controllers;

use App\Models\Conversacion;
use App\Models\Coche;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConversacionController extends Controller
{
    /**
     * Obtener todas las conversaciones del usuario autenticado
     */
    public function index()
    {
        $user = Auth::user();

        $conversaciones = Conversacion::with([
            'coche:id,id_marca,id_modelo,precio', // Incluir las claves foráneas id_marca e id_modelo
            'coche.marca:id,nombre', // Ahora sí podemos seleccionar nombre porque tenemos id_marca
            'coche.modelo:id,nombre', // Ahora sí podemos seleccionar nombre porque tenemos id_modelo
            'coche.imagenes:id,id_coche,ruta',
            'comprador:id,nombre',
            'vendedor:id,nombre',
            'mensajes' => function ($query) {
                $query->latest()->take(1);
            },
            'mensajes.remitente:id,nombre'
        ])
            ->where(function ($query) use ($user) {
                $query->where('id_comprador', $user->id)
                    ->orWhere('id_vendedor', $user->id);
            })
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($conversaciones);
    }

    /**
     * Crear o obtener una conversación existente
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_coche' => 'required|exists:coches,id'
        ]);

        $coche = Coche::findOrFail($request->id_coche);
        $comprador = Auth::user();

        // No permitir que el vendedor se contacte consigo mismo
        if ($coche->id_usuario === $comprador->id) {
            return response()->json([
                'message' => 'No puedes iniciar una conversación sobre tu propio anuncio'
            ], 400);
        }

        // Verificar si ya existe una conversación
        $conversacion = Conversacion::where('id_coche', $request->id_coche)
            ->where('id_comprador', $comprador->id)
            ->where('id_vendedor', $coche->id_usuario)
            ->first();

        if (!$conversacion) {
            // Crear nueva conversación
            $conversacion = Conversacion::create([
                'id_coche' => $request->id_coche,
                'id_comprador' => $comprador->id,
                'id_vendedor' => $coche->id_usuario
            ]);
        }

        // Cargar relaciones para la respuesta
        $conversacion->load([
            'coche:id,id_marca,id_modelo,precio', // Incluir claves foráneas
            'coche.marca:id,nombre',
            'coche.modelo:id,nombre',
            'comprador:id,nombre',
            'vendedor:id,nombre'
        ]);

        return response()->json($conversacion, 201);
    }

    /**
     * Obtener una conversación específica con sus mensajes
     */
    public function show($id)
    {
        $user = Auth::user();

        $conversacion = Conversacion::with([
            'coche:id,id_marca,id_modelo,precio', // Incluir claves foráneas
            'coche.marca:id,nombre',
            'coche.modelo:id,nombre',
            'coche.imagenes:id,id_coche,ruta',
            'comprador:id,nombre',
            'vendedor:id,nombre',
            'mensajes.remitente:id,nombre'
        ])
            ->where('id', $id)
            ->where(function ($query) use ($user) {
                $query->where('id_comprador', $user->id)
                    ->orWhere('id_vendedor', $user->id);
            })
            ->firstOrFail();

        // Marcar mensajes como leídos
        $conversacion->mensajes()
            ->where('id_remitente', '!=', $user->id)
            ->where('leido', false)
            ->update(['leido' => true]);

        return response()->json($conversacion);
    }

    /**
     * Eliminar una conversación
     */
    public function destroy($id)
    {
        $user = Auth::user();

        $conversacion = Conversacion::where('id', $id)
            ->where(function ($query) use ($user) {
                $query->where('id_comprador', $user->id)
                    ->orWhere('id_vendedor', $user->id);
            })
            ->firstOrFail();

        $conversacion->mensajes()->delete();
        $conversacion->delete();

        return response()->json(null, 204);
    }
}
