<?php

namespace App\Http\Controllers\Admin;

use App\Models\Coche;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminAdsController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/admin/ads",
     *     tags={"Admin - Anuncios"},
     *     summary="Lista todos los anuncios del sistema",
     *     description="Obtiene una lista paginada de anuncios con filtros para administradores",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="page", in="query", description="Número de página", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="per_page", in="query", description="Elementos por página", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="search", in="query", description="Buscar por marca/modelo", @OA\Schema(type="string")),
     *     @OA\Parameter(name="verificado", in="query", description="Filtrar por verificación", @OA\Schema(type="string")),
     *     @OA\Parameter(name="vendido", in="query", description="Filtrar por estado de venta", @OA\Schema(type="string")),
     *     @OA\Parameter(name="destacado", in="query", description="Filtrar por destacados", @OA\Schema(type="string")),
     *     @OA\Parameter(name="precio_min", in="query", description="Precio mínimo", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="precio_max", in="query", description="Precio máximo", @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de anuncios",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="current_page", type="integer"),
     *             @OA\Property(property="total", type="integer")
     *         )
     *     )
     * )
     */
    public function listar(Request $request)
    {
        try {
            // Log para debug
            Log::info('AdminAds: Parámetros recibidos', $request->all());

            $query = Coche::with([
                'usuario:id,nombre,email',
                'marca:id,nombre',
                'modelo:id,nombre',
                'categoria:id,nombre',
                'provincia:id,nombre',
                'imagenes'
            ]);

            // Filtro de búsqueda por marca/modelo/descripción/vendedor
            if ($request->filled('search')) {
                $busqueda = trim($request->search);
                $query->where(function ($q) use ($busqueda) {
                    $q->whereHas('marca', function ($marca) use ($busqueda) {
                        $marca->where('nombre', 'LIKE', "%{$busqueda}%");
                    })
                        ->orWhereHas('modelo', function ($modelo) use ($busqueda) {
                            $modelo->where('nombre', 'LIKE', "%{$busqueda}%");
                        })
                        ->orWhereHas('usuario', function ($usuario) use ($busqueda) {
                            $usuario->where('nombre', 'LIKE', "%{$busqueda}%")
                                ->orWhere('email', 'LIKE', "%{$busqueda}%");
                        })
                        ->orWhere('descripcion', 'LIKE', "%{$busqueda}%");
                });
            }

            // Filtro por verificación (corregido)
            if ($request->filled('verificado')) {
                $verificado = $request->verificado;
                if ($verificado === '1' || $verificado === 'true') {
                    $query->where('verificado', true);
                } elseif ($verificado === '0' || $verificado === 'false') {
                    $query->where('verificado', false);
                }
            }

            // Filtro por estado de venta (corregido)
            if ($request->filled('vendido')) {
                $vendido = $request->vendido;
                if ($vendido === '1' || $vendido === 'true') {
                    $query->where('vendido', true);
                } elseif ($vendido === '0' || $vendido === 'false') {
                    $query->where('vendido', false);
                }
            }

            // Filtro por destacado (corregido)
            if ($request->filled('destacado')) {
                $destacado = $request->destacado;
                if ($destacado === '1' || $destacado === 'true') {
                    $query->where('destacado', true);
                } elseif ($destacado === '0' || $destacado === 'false') {
                    $query->where('destacado', false);
                }
            }

            // Filtros por precio
            if ($request->filled('precio_min') && is_numeric($request->precio_min)) {
                $query->where('precio', '>=', $request->precio_min);
            }

            if ($request->filled('precio_max') && is_numeric($request->precio_max)) {
                $query->where('precio', '<=', $request->precio_max);
            }

            // Filtro por usuario específico
            if ($request->filled('user_id')) {
                $query->where('id_usuario', $request->user_id);
            }

            // Ordenar por fecha de creación (más recientes primero)
            $query->orderBy('created_at', 'desc');

            // Paginación
            $perPage = $request->get('per_page', 15);
            $perPage = min($perPage, 100); // Máximo 100 por página

            $anuncios = $query->paginate($perPage);

            // Log para debug
            Log::info('AdminAds: Query SQL', ['sql' => $query->toSql(), 'bindings' => $query->getBindings()]);
            Log::info('AdminAds: Resultados encontrados', ['total' => $anuncios->total()]);

            return response()->json([
                'data' => $anuncios->items(),
                'current_page' => $anuncios->currentPage(),
                'last_page' => $anuncios->lastPage(),
                'per_page' => $anuncios->perPage(),
                'total' => $anuncios->total(),
                'from' => $anuncios->firstItem(),
                'to' => $anuncios->lastItem()
            ]);
        } catch (\Exception $e) {
            Log::error('AdminAds: Error en listar', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Error al obtener los anuncios',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/admin/ads/{id}",
     *     tags={"Admin - Anuncios"},
     *     summary="Obtiene detalles de un anuncio específico",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Detalles del anuncio"),
     *     @OA\Response(response=404, description="Anuncio no encontrado")
     * )
     */
    public function mostrar($id)
    {
        try {
            $anuncio = Coche::with([
                'usuario:id,nombre,email,telefono',
                'marca:id,nombre',
                'modelo:id,nombre',
                'categoria:id,nombre',
                'provincia:id,nombre',
                'imagenes',
                'documentos',
                'conversaciones'
            ])->findOrFail($id);

            return response()->json($anuncio);
        } catch (\Exception $e) {
            Log::error('AdminAds: Error en mostrar', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Anuncio no encontrado',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/admin/ads/{id}",
     *     tags={"Admin - Anuncios"},
     *     summary="Actualizar anuncio (admin)",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="verificado", type="boolean"),
     *             @OA\Property(property="destacado", type="boolean"),
     *             @OA\Property(property="vendido", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Anuncio actualizado"),
     *     @OA\Response(response=404, description="Anuncio no encontrado")
     * )
     */
    public function actualizar(Request $request, $id)
    {
        $request->validate([
            'verificado' => 'sometimes|boolean',
            'destacado' => 'sometimes|boolean',
            'vendido' => 'sometimes|boolean'
        ]);

        try {
            DB::beginTransaction();

            $anuncio = Coche::findOrFail($id);

            // Solo actualizar campos que puede modificar el admin
            if ($request->has('verificado')) {
                $anuncio->verificado = $request->boolean('verificado');
            }

            if ($request->has('destacado')) {
                $anuncio->destacado = $request->boolean('destacado');
            }

            if ($request->has('vendido')) {
                $anuncio->vendido = $request->boolean('vendido');
            }

            $anuncio->save();

            DB::commit();

            return response()->json([
                'message' => 'Anuncio actualizado correctamente',
                'data' => $anuncio->load(['marca', 'modelo', 'usuario'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('AdminAds: Error en actualizar', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Error al actualizar el anuncio',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/admin/ads/{id}",
     *     tags={"Admin - Anuncios"},
     *     summary="Eliminar anuncio",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Anuncio eliminado"),
     *     @OA\Response(response=404, description="Anuncio no encontrado")
     * )
     */
    public function eliminar($id)
    {
        try {
            DB::beginTransaction();

            $anuncio = Coche::findOrFail($id);

            // Eliminar imágenes físicas y registros
            foreach ($anuncio->imagenes as $imagen) {
                $rutaCompleta = storage_path('app/public/' . str_replace('storage/', '', $imagen->ruta));
                if (file_exists($rutaCompleta)) {
                    unlink($rutaCompleta);
                }
                $imagen->delete();
            }

            // Eliminar documentos físicos y registros
            foreach ($anuncio->documentos as $documento) {
                $rutaCompleta = storage_path('app/public/' . str_replace('storage/', '', $documento->ruta));
                if (file_exists($rutaCompleta)) {
                    unlink($rutaCompleta);
                }
                $documento->delete();
            }

            // Eliminar conversaciones y mensajes relacionados
            foreach ($anuncio->conversaciones as $conversacion) {
                $conversacion->mensajes()->delete();
                $conversacion->delete();
            }

            // Eliminar favoritos relacionados
            $anuncio->favoritos()->delete();

            // Eliminar el anuncio
            $anuncio->delete();

            DB::commit();

            return response()->json([
                'message' => 'Anuncio eliminado correctamente'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('AdminAds: Error en eliminar', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Error al eliminar el anuncio',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/admin/ads/{id}/feature",
     *     tags={"Admin - Anuncios"},
     *     summary="Destacar/Quitar destaque de anuncio",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="destacado", type="boolean", description="Destacar o quitar destaque")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Estado actualizado"),
     *     @OA\Response(response=404, description="Anuncio no encontrado")
     * )
     */
    public function destacar(Request $request, $id)
    {
        $request->validate([
            'destacado' => 'required|boolean'
        ]);

        try {
            $anuncio = Coche::findOrFail($id);

            $anuncio->destacado = $request->boolean('destacado');
            $anuncio->save();

            return response()->json([
                'message' => $request->boolean('destacado')
                    ? 'Anuncio destacado correctamente'
                    : 'Se quitó el destaque del anuncio',
                'data' => $anuncio->load(['marca', 'modelo', 'usuario'])
            ]);
        } catch (\Exception $e) {
            Log::error('AdminAds: Error en destacar', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Error al actualizar el destacado',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/admin/ads/statistics",
     *     tags={"Admin - Anuncios"},
     *     summary="Estadísticas de anuncios",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Estadísticas de anuncios")
     * )
     */
    public function estadisticas()
    {
        try {
            $totalAnuncios = Coche::count();
            $anunciosActivos = Coche::where('vendido', false)->count();
            $anunciosVendidos = Coche::where('vendido', true)->count();
            $anunciosVerificados = Coche::where('verificado', true)->count();
            $anunciosDestacados = Coche::where('destacado', true)->count();
            $anunciosPendientesVerificacion = Coche::where('verificado', false)->count();

            // Estadísticas por mes (últimos 6 meses)
            $estadisticasPorMes = [];
            for ($i = 5; $i >= 0; $i--) {
                $fecha = now()->subMonths($i);
                $cantidad = Coche::whereYear('created_at', $fecha->year)
                    ->whereMonth('created_at', $fecha->month)
                    ->count();

                $estadisticasPorMes[] = [
                    'mes' => $fecha->format('M Y'),
                    'cantidad' => $cantidad
                ];
            }

            // Top marcas más populares
            $topMarcas = Coche::select('id_marca')
                ->with('marca:id,nombre')
                ->groupBy('id_marca')
                ->selectRaw('count(*) as total')
                ->orderBy('total', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'marca' => $item->marca->nombre,
                        'cantidad' => $item->total
                    ];
                });

            return response()->json([
                'data' => [
                    'resumen' => [
                        'total' => $totalAnuncios,
                        'activos' => $anunciosActivos,
                        'vendidos' => $anunciosVendidos,
                        'verificados' => $anunciosVerificados,
                        'destacados' => $anunciosDestacados,
                        'pendientes_verificacion' => $anunciosPendientesVerificacion
                    ],
                    'por_mes' => $estadisticasPorMes,
                    'top_marcas' => $topMarcas
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('AdminAds: Error en estadísticas', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Error al obtener estadísticas',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
