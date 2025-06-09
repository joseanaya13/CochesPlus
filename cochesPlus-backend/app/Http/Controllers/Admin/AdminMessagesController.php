<?php

namespace App\Http\Controllers\Admin;

use App\Models\Mensaje;
use App\Models\Conversacion;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class AdminMessagesController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/admin/messages",
     *     tags={"Admin - Mensajes"},
     *     summary="Lista todos los mensajes del sistema",
     *     description="Obtiene lista paginada de mensajes con filtros para administradores",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="page", in="query", description="Número de página", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="per_page", in="query", description="Elementos por página", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="search", in="query", description="Buscar en contenido", @OA\Schema(type="string")),
     *     @OA\Parameter(name="user_id", in="query", description="Filtrar por usuario", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="conversation_id", in="query", description="Filtrar por conversación", @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de mensajes",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="current_page", type="integer"),
     *             @OA\Property(property="total", type="integer")
     *         )
     *     )
     * )
     */
    public function listar(Request $solicitud)
    {
        $consulta = Mensaje::with(['remitente', 'conversacion.coche.marca', 'conversacion.coche.modelo']);

        // Filtro de búsqueda en contenido
        if ($solicitud->has('search') && $solicitud->search) {
            $busqueda = $solicitud->search;
            $consulta->where('contenido', 'like', "%{$busqueda}%");
        }

        // Filtro por usuario remitente
        if ($solicitud->has('user_id') && $solicitud->user_id) {
            $consulta->where('id_remitente', $solicitud->user_id);
        }

        // Filtro por conversación
        if ($solicitud->has('conversation_id') && $solicitud->conversation_id) {
            $consulta->where('id_conversacion', $solicitud->conversation_id);
        }

        // Ordenar por fecha de creación (más recientes primero)
        $consulta->orderBy('created_at', 'desc');

        $mensajes = $consulta->paginate($solicitud->get('per_page', 20));

        // Transformar los datos
        $mensajes->getCollection()->transform(function ($mensaje) {
            return [
                'id' => $mensaje->id,
                'contenido' => $mensaje->contenido,
                'leido' => $mensaje->leido,
                'creado_en' => $mensaje->created_at,
                'remitente' => [
                    'id' => $mensaje->remitente->id,
                    'nombre' => $mensaje->remitente->nombre,
                    'email' => $mensaje->remitente->email
                ],
                'conversacion' => [
                    'id' => $mensaje->conversacion->id,
                    'coche' => [
                        'marca' => $mensaje->conversacion->coche->marca->nombre,
                        'modelo' => $mensaje->conversacion->coche->modelo->nombre,
                        'precio' => $mensaje->conversacion->coche->precio
                    ]
                ]
            ];
        });

        return response()->json([
            'exito' => true,
            'mensaje' => 'Lista de mensajes obtenida correctamente',
            'datos' => $mensajes
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/messages/{id}",
     *     tags={"Admin - Mensajes"},
     *     summary="Obtiene detalles de un mensaje específico",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Detalles del mensaje"),
     *     @OA\Response(response=404, description="Mensaje no encontrado")
     * )
     */
    public function mostrar($id)
    {
        $mensaje = Mensaje::with([
            'remitente',
            'conversacion.coche.marca',
            'conversacion.coche.modelo',
            'conversacion.comprador',
            'conversacion.vendedor'
        ])->findOrFail($id);

        return response()->json([
            'exito' => true,
            'mensaje' => 'Detalles del mensaje obtenidos correctamente',
            'datos' => [
                'id' => $mensaje->id,
                'contenido' => $mensaje->contenido,
                'leido' => $mensaje->leido,
                'creado_en' => $mensaje->created_at,
                'remitente' => [
                    'id' => $mensaje->remitente->id,
                    'nombre' => $mensaje->remitente->nombre,
                    'email' => $mensaje->remitente->email
                ],
                'conversacion' => [
                    'id' => $mensaje->conversacion->id,
                    'comprador' => [
                        'id' => $mensaje->conversacion->comprador->id,
                        'nombre' => $mensaje->conversacion->comprador->nombre,
                        'email' => $mensaje->conversacion->comprador->email
                    ],
                    'vendedor' => [
                        'id' => $mensaje->conversacion->vendedor->id,
                        'nombre' => $mensaje->conversacion->vendedor->nombre,
                        'email' => $mensaje->conversacion->vendedor->email
                    ],
                    'coche' => [
                        'id' => $mensaje->conversacion->coche->id,
                        'marca' => $mensaje->conversacion->coche->marca->nombre,
                        'modelo' => $mensaje->conversacion->coche->modelo->nombre,
                        'precio' => $mensaje->conversacion->coche->precio
                    ]
                ]
            ]
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/admin/messages/{id}",
     *     tags={"Admin - Mensajes"},
     *     summary="Eliminar mensaje",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Mensaje eliminado"),
     *     @OA\Response(response=404, description="Mensaje no encontrado")
     * )
     */
    public function eliminar($id)
    {
        $mensaje = Mensaje::findOrFail($id);
        $mensaje->delete();

        return response()->json([
            'exito' => true,
            'mensaje' => 'Mensaje eliminado correctamente'
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/conversations",
     *     tags={"Admin - Mensajes"},
     *     summary="Lista todas las conversaciones del sistema",
     *     description="Vista de conversaciones para administradores",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="page", in="query", description="Número de página", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="per_page", in="query", description="Elementos por página", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="active_only", in="query", description="Solo conversaciones activas", @OA\Schema(type="boolean")),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de conversaciones",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="current_page", type="integer"),
     *             @OA\Property(property="total", type="integer")
     *         )
     *     )
     * )
     */
    public function conversaciones(Request $solicitud)
    {
        $consulta = Conversacion::with([
            'coche.marca',
            'coche.modelo',
            'comprador',
            'vendedor',
            'mensajes' => function ($q) {
                $q->latest()->take(1);
            }
        ]);

        // Filtro para conversaciones activas (con mensajes recientes)
        if ($solicitud->has('active_only') && $solicitud->active_only) {
            $consulta->whereHas('mensajes', function ($q) {
                $q->where('created_at', '>=', now()->subDays(30));
            });
        }

        // Ordenar por última actividad
        $consulta->orderBy('updated_at', 'desc');

        $conversaciones = $consulta->paginate($solicitud->get('per_page', 15));

        // Transformar los datos
        $conversaciones->getCollection()->transform(function ($conversacion) {
            $ultimoMensaje = $conversacion->mensajes->first();

            return [
                'id' => $conversacion->id,
                'comprador' => [
                    'id' => $conversacion->comprador->id,
                    'nombre' => $conversacion->comprador->nombre,
                    'email' => $conversacion->comprador->email
                ],
                'vendedor' => [
                    'id' => $conversacion->vendedor->id,
                    'nombre' => $conversacion->vendedor->nombre,
                    'email' => $conversacion->vendedor->email
                ],
                'coche' => [
                    'id' => $conversacion->coche->id,
                    'marca' => $conversacion->coche->marca->nombre,
                    'modelo' => $conversacion->coche->modelo->nombre,
                    'precio' => $conversacion->coche->precio
                ],
                'ultimo_mensaje' => $ultimoMensaje ? [
                    'contenido' => substr($ultimoMensaje->contenido, 0, 100) . '...',
                    'fecha' => $ultimoMensaje->created_at,
                    'remitente' => $ultimoMensaje->remitente->nombre
                ] : null,
                'cantidad_mensajes' => $conversacion->mensajes()->count(),
                'creado_en' => $conversacion->created_at,
                'actualizado_en' => $conversacion->updated_at
            ];
        });

        return response()->json([
            'exito' => true,
            'mensaje' => 'Lista de conversaciones obtenida correctamente',
            'datos' => $conversaciones
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/admin/conversations/{id}/close",
     *     tags={"Admin - Mensajes"},
     *     summary="Cerrar conversación (marcar como inactiva)",
     *     description="Funcionalidad administrativa para gestionar conversaciones",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="razon", type="string", description="Razón del cierre")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Conversación cerrada"),
     *     @OA\Response(response=404, description="Conversación no encontrada")
     * )
     */
    public function cerrarConversacion(Request $solicitud, $id)
    {
        $conversacion = Conversacion::findOrFail($id);

        // Aquí podrías agregar un campo 'activa' o 'cerrada' a la tabla conversaciones
        // Por ahora, simplemente devolvemos un mensaje

        return response()->json([
            'exito' => true,
            'mensaje' => 'Conversación marcada como cerrada',
            'datos' => [
                'conversacion' => $conversacion->load(['comprador', 'vendedor', 'coche.marca', 'coche.modelo']),
                'razon' => $solicitud->get('razon', 'Cerrada por administrador')
            ]
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/conversations/{id}/messages",
     *     tags={"Admin - Mensajes"},
     *     summary="Ver todos los mensajes de una conversación específica",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Mensajes de la conversación"),
     *     @OA\Response(response=404, description="Conversación no encontrada")
     * )
     */
    public function mensajesConversacion($id)
    {
        $conversacion = Conversacion::with([
            'mensajes.remitente',
            'comprador',
            'vendedor',
            'coche.marca',
            'coche.modelo'
        ])->findOrFail($id);

        return response()->json([
            'exito' => true,
            'mensaje' => 'Mensajes de la conversación obtenidos correctamente',
            'datos' => [
                'conversacion' => [
                    'id' => $conversacion->id,
                    'comprador' => $conversacion->comprador,
                    'vendedor' => $conversacion->vendedor,
                    'coche' => [
                        'id' => $conversacion->coche->id,
                        'marca' => $conversacion->coche->marca->nombre,
                        'modelo' => $conversacion->coche->modelo->nombre,
                        'precio' => $conversacion->coche->precio
                    ]
                ],
                'mensajes' => $conversacion->mensajes->map(function ($mensaje) {
                    return [
                        'id' => $mensaje->id,
                        'contenido' => $mensaje->contenido,
                        'leido' => $mensaje->leido,
                        'creado_en' => $mensaje->created_at,
                        'remitente' => [
                            'id' => $mensaje->remitente->id,
                            'nombre' => $mensaje->remitente->nombre
                        ]
                    ];
                })
            ]
        ]);
    }
}
