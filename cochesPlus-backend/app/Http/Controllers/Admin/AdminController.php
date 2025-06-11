<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use App\Models\Coche;
use App\Models\Mensaje;
use App\Models\Conversacion;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/admin/dashboard",
     *     tags={"Admin"},
     *     summary="Panel de control principal de administración",
     *     description="Obtiene estadísticas generales del sistema para el panel de control administrativo",
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Datos del panel de control",
     *         @OA\JsonContent(
     *             @OA\Property(property="usuarios", type="object",
     *                 @OA\Property(property="total", type="integer", example=150),
     *                 @OA\Property(property="nuevos_mes", type="integer", example=12),
     *                 @OA\Property(property="activos", type="integer", example=89),
     *                 @OA\Property(property="por_rol", type="object")
     *             ),
     *             @OA\Property(property="anuncios", type="object",
     *                 @OA\Property(property="total", type="integer", example=45),
     *                 @OA\Property(property="activos", type="integer", example=38),
     *                 @OA\Property(property="vendidos", type="integer", example=7),
     *                 @OA\Property(property="verificados", type="integer", example=25),
     *                 @OA\Property(property="pendientes_verificacion", type="integer", example=13)
     *             ),
     *             @OA\Property(property="conversaciones", type="object",
     *                 @OA\Property(property="total", type="integer", example=123),
     *                 @OA\Property(property="activas", type="integer", example=67),
     *                 @OA\Property(property="mensajes_hoy", type="integer", example=34)
     *             ),
     *             @OA\Property(property="estadisticas_recientes", type="object",
     *                 @OA\Property(property="usuarios_ultima_semana", type="array", @OA\Items(type="integer")),
     *                 @OA\Property(property="anuncios_ultima_semana", type="array", @OA\Items(type="integer"))
     *             )
     *         )
     *     ),
     *     @OA\Response(response=403, description="No autorizado")
     * )
     */
    public function panelControl()
    {
        // Estadísticas de usuarios
        $totalUsuarios = User::count();
        $usuariosNuevosMes = User::where('created_at', '>=', now()->subMonth())->count();
        $usuariosActivos = User::where('updated_at', '>=', now()->subDays(30))->count();

        // Usuarios por rol
        $usuariosPorRol = User::with('roles')
            ->get()
            ->groupBy(function ($usuario) {
                return $usuario->roles->pluck('name')->first() ?? 'sin_rol';
            })
            ->map(function ($grupo) {
                return $grupo->count();
            });

        // Estadísticas de anuncios
        $totalAnuncios = Coche::count();
        $anunciosActivos = Coche::where('vendido', false)->count();
        $anunciosVendidos = Coche::where('vendido', true)->count();
        $anunciosVerificados = Coche::where('verificado', true)->count();
        $anunciosPendientes = Coche::where('verificado', false)
                                   ->whereHas('documentos')
                                   ->count();

        // Estadísticas de conversaciones
        $totalConversaciones = Conversacion::count();
        $conversacionesActivas = Conversacion::whereHas('mensajes', function ($consulta) {
            $consulta->where('created_at', '>=', now()->subDays(7));
        })->count();
        $mensajesHoy = Mensaje::whereDate('created_at', today())->count();

        // Estadísticas de la última semana
        $usuariosUltimaSemana = [];
        $anunciosUltimaSemana = [];

        for ($i = 6; $i >= 0; $i--) {
            $fecha = now()->subDays($i)->toDateString();
            $usuariosUltimaSemana[] = User::whereDate('created_at', $fecha)->count();
            $anunciosUltimaSemana[] = Coche::whereDate('created_at', $fecha)->count();
        }

        return response()->json([
            'exito' => true,
            'mensaje' => 'Estadísticas del panel de control obtenidas correctamente',
            'datos' => [
                'usuarios' => [
                    'total' => $totalUsuarios,
                    'nuevos_mes' => $usuariosNuevosMes,
                    'activos' => $usuariosActivos,
                    'por_rol' => $usuariosPorRol
                ],
                'anuncios' => [
                    'total' => $totalAnuncios,
                    'activos' => $anunciosActivos,
                    'vendidos' => $anunciosVendidos,
                    'verificados' => $anunciosVerificados,
                    'pendientes_verificacion' => $anunciosPendientes
                ],
                'conversaciones' => [
                    'total' => $totalConversaciones,
                    'activas' => $conversacionesActivas,
                    'mensajes_hoy' => $mensajesHoy
                ],
                'estadisticas_recientes' => [
                    'usuarios_ultima_semana' => $usuariosUltimaSemana,
                    'anuncios_ultima_semana' => $anunciosUltimaSemana
                ]
            ]
        ]);
    }
}
