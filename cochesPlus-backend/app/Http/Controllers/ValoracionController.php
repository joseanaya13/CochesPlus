<?php

namespace App\Http\Controllers;

use App\Models\Valoracion;
use App\Models\Compra;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ValoracionController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/vendedores/{vendedorId}/valoraciones",
     *     tags={"Valoraciones"},
     *     summary="Obtener valoraciones de un vendedor",
     *     description="Devuelve todas las valoraciones de un vendedor específico",
     *     @OA\Parameter(
     *         name="vendedorId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID del vendedor"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Valoraciones del vendedor",
     *         @OA\JsonContent(
     *             @OA\Property(property="valoraciones", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="puntuacion", type="integer"),
     *                 @OA\Property(property="comentario", type="string"),
     *                 @OA\Property(property="fecha", type="string"),
     *                 @OA\Property(property="comprador", type="object")
     *             )),
     *             @OA\Property(property="estadisticas", type="object",
     *                 @OA\Property(property="promedio", type="number"),
     *                 @OA\Property(property="total", type="integer")
     *             )
     *         )
     *     )
     * )
     */
    public function getValoracionesVendedor($vendedorId)
    {
        $vendedor = User::findOrFail($vendedorId);

        $valoraciones = Valoracion::select('valoraciones.*', 'usuarios.nombre as comprador_nombre')
            ->join('compras', 'valoraciones.id_compra', '=', 'compras.id')
            ->join('usuarios', 'compras.id_comprador', '=', 'usuarios.id')
            ->where('compras.id_vendedor', $vendedorId)
            ->orderBy('valoraciones.created_at', 'desc')
            ->get()
            ->map(function ($valoracion) {
                return [
                    'id' => $valoracion->id,
                    'puntuacion' => $valoracion->puntuacion,
                    'comentario' => $valoracion->comentario,
                    'fecha' => $valoracion->created_at->format('d/m/Y'),
                    'comprador' => [
                        'nombre' => $valoracion->comprador_nombre
                    ]
                ];
            });

        // Calcular estadísticas
        $totalValoraciones = $valoraciones->count();
        $promedioValoracion = $totalValoraciones > 0
            ? round($valoraciones->avg('puntuacion'), 1)
            : 0;

        return response()->json([
            'valoraciones' => $valoraciones,
            'estadisticas' => [
                'promedio' => $promedioValoracion,
                'total' => $totalValoraciones,
                'distribucion' => $this->getDistribucionPuntuaciones($vendedorId)
            ]
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/valoraciones",
     *     tags={"Valoraciones"},
     *     summary="Crear nueva valoración",
     *     description="Permite al comprador valorar un vendedor después de una compra",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"id_compra", "puntuacion"},
     *             @OA\Property(property="id_compra", type="integer", description="ID de la compra"),
     *             @OA\Property(property="puntuacion", type="integer", minimum=1, maximum=5, description="Puntuación de 1 a 5"),
     *             @OA\Property(property="comentario", type="string", description="Comentario opcional")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Valoración creada exitosamente"
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Error de validación o compra no válida"
     *     ),
     *     @OA\Response(
     *         response=409,
     *         description="Ya existe una valoración para esta compra"
     *     )
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_compra' => 'required|exists:compras,id',
            'puntuacion' => 'required|integer|min:1|max:5',
            'comentario' => 'nullable|string|max:1000'
        ], [
            'id_compra.required' => 'La compra es obligatoria',
            'id_compra.exists' => 'La compra no existe',
            'puntuacion.required' => 'La puntuación es obligatoria',
            'puntuacion.integer' => 'La puntuación debe ser un número entero',
            'puntuacion.min' => 'La puntuación mínima es 1',
            'puntuacion.max' => 'La puntuación máxima es 5',
            'comentario.max' => 'El comentario no puede exceder los 1000 caracteres'
        ]);

        $compra = Compra::findOrFail($request->id_compra);

        // Verificar que el usuario autenticado es el comprador
        if ($compra->id_comprador !== Auth::id()) {
            return response()->json([
                'message' => 'No tienes permisos para valorar esta compra'
            ], 403);
        }

        // Verificar que la compra esté confirmada por ambas partes
        if (!$compra->confirmacion_comprador || !$compra->confirmacion_vendedor) {
            return response()->json([
                'message' => 'La compra debe estar confirmada por ambas partes para poder valorar'
            ], 400);
        }

        // Verificar que no existe ya una valoración para esta compra
        $valoracionExistente = Valoracion::where('id_compra', $request->id_compra)->first();
        if ($valoracionExistente) {
            return response()->json([
                'message' => 'Ya has valorado esta compra'
            ], 409);
        }

        try {
            DB::beginTransaction();

            $valoracion = Valoracion::create([
                'id_compra' => $request->id_compra,
                'puntuacion' => $request->puntuacion,
                'comentario' => $request->comentario
            ]);

            DB::commit();

            // Cargar relaciones para la respuesta
            $valoracion->load(['compra.vendedor:id,nombre', 'compra.coche.marca', 'compra.coche.modelo']);

            return response()->json([
                'message' => 'Valoración creada correctamente',
                'valoracion' => $valoracion
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear la valoración',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/user/compras-sin-valorar",
     *     tags={"Valoraciones"},
     *     summary="Obtener compras sin valorar del usuario",
     *     description="Devuelve las compras del usuario autenticado que aún no han sido valoradas",
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de compras sin valorar"
     *     )
     * )
     */
    public function getComprasSinValorar()
    {
        $comprasSinValorar = Compra::with(['coche.marca', 'coche.modelo', 'vendedor:id,nombre'])
            ->whereDoesntHave('valoracion')
            ->where('id_comprador', Auth::id())
            ->where('confirmacion_comprador', true)
            ->where('confirmacion_vendedor', true)
            ->orderBy('fecha_venta', 'desc')
            ->get();

        return response()->json($comprasSinValorar);
    }

    /**
     * @OA\Get(
     *     path="/api/user/valoraciones-realizadas",
     *     tags={"Valoraciones"},
     *     summary="Obtener valoraciones realizadas por el usuario",
     *     description="Devuelve todas las valoraciones que ha realizado el usuario autenticado",
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de valoraciones realizadas"
     *     )
     * )
     */
    public function getValoracionesRealizadas()
    {
        $valoraciones = Valoracion::select('valoraciones.*')
            ->join('compras', 'valoraciones.id_compra', '=', 'compras.id')
            ->with(['compra.coche.marca', 'compra.coche.modelo', 'compra.vendedor:id,nombre'])
            ->where('compras.id_comprador', Auth::id())
            ->orderBy('valoraciones.created_at', 'desc')
            ->get();

        return response()->json($valoraciones);
    }

    /**
     * @OA\Put(
     *     path="/api/valoraciones/{id}",
     *     tags={"Valoraciones"},
     *     summary="Actualizar valoración existente",
     *     description="Permite actualizar una valoración propia (solo dentro de las primeras 24 horas)",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="puntuacion", type="integer", minimum=1, maximum=5),
     *             @OA\Property(property="comentario", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Valoración actualizada exitosamente"
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'puntuacion' => 'sometimes|required|integer|min:1|max:5',
            'comentario' => 'nullable|string|max:1000'
        ]);

        $valoracion = Valoracion::with('compra')->findOrFail($id);

        // Verificar que el usuario autenticado es el autor de la valoración
        if ($valoracion->compra->id_comprador !== Auth::id()) {
            return response()->json([
                'message' => 'No tienes permisos para modificar esta valoración'
            ], 403);
        }

        // Verificar que la valoración tenga menos de 24 horas
        if ($valoracion->created_at->diffInHours(now()) > 24) {
            return response()->json([
                'message' => 'Solo puedes modificar la valoración dentro de las primeras 24 horas'
            ], 400);
        }

        $valoracion->update($request->only(['puntuacion', 'comentario']));

        return response()->json([
            'message' => 'Valoración actualizada correctamente',
            'valoracion' => $valoracion
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/valoraciones/{id}",
     *     tags={"Valoraciones"},
     *     summary="Eliminar valoración",
     *     description="Permite eliminar una valoración propia (solo administradores o dentro de las primeras 24 horas)",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=204,
     *         description="Valoración eliminada exitosamente"
     *     )
     * )
     */
    public function destroy($id)
    {
        $valoracion = Valoracion::with('compra')->findOrFail($id);

        $user = Auth::user();

        // Verificar permisos
        $esAdmin = isset($user->role) && $user->role === 'admin';
        $puedeEliminar = $esAdmin ||
            ($valoracion->compra->id_comprador === $user->id &&
                $valoracion->created_at->diffInHours(now()) <= 24);

        if (!$puedeEliminar) {
            return response()->json([
                'message' => 'No tienes permisos para eliminar esta valoración'
            ], 403);
        }

        $valoracion->delete();

        return response()->json(null, 204);
    }

    /**
     * Obtener distribución de puntuaciones para un vendedor
     */
    private function getDistribucionPuntuaciones($vendedorId)
    {
        $distribucion = [];

        for ($i = 1; $i <= 5; $i++) {
            $count = Valoracion::join('compras', 'valoraciones.id_compra', '=', 'compras.id')
                ->where('compras.id_vendedor', $vendedorId)
                ->where('valoraciones.puntuacion', $i)
                ->count();

            $distribucion[$i] = $count;
        }

        return $distribucion;
    }

    /**
     * @OA\Get(
     *     path="/api/user/estadisticas-vendedor",
     *     tags={"Valoraciones"},
     *     summary="Obtener estadísticas como vendedor",
     *     description="Devuelve las estadísticas de valoraciones del usuario autenticado como vendedor",
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Estadísticas del vendedor"
     *     )
     * )
     */
    public function getEstadisticasVendedor()
    {
        $userId = Auth::id();

        return $this->getValoracionesVendedor($userId);
    }
}
