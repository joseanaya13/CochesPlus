<?php

namespace App\Http\Controllers;

use App\Models\Compra;
use App\Models\Coche;
use App\Models\Conversacion;
use App\Events\PurchaseStatusChanged;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CompraController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/compras",
     *     tags={"Compras"},
     *     summary="Iniciar proceso de compra",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"id_coche", "precio_acordado"},
     *             @OA\Property(property="id_coche", type="integer"),
     *             @OA\Property(property="precio_acordado", type="number"),
     *             @OA\Property(property="condiciones", type="string"),
     *             @OA\Property(property="id_conversacion", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Proceso de compra iniciado")
     * )
     */
    public function iniciarCompra(Request $request)
    {
        $request->validate([
            'id_coche' => 'required|exists:coches,id',
            'precio_acordado' => 'required|numeric|min:1',
            'condiciones' => 'nullable|string|max:1000',
            'id_conversacion' => 'nullable|exists:conversaciones,id'
        ]);

        try {
            DB::beginTransaction();

            $coche = Coche::findOrFail($request->id_coche);
            $comprador = Auth::user();

            // Verificaciones de seguridad
            if ($coche->id_usuario === $comprador->id) {
                return response()->json([
                    'message' => 'No puedes comprar tu propio coche'
                ], 400);
            }

            if ($coche->vendido) {
                return response()->json([
                    'message' => 'Este coche ya ha sido vendido'
                ], 400);
            }

            // Verificar si ya existe una compra pendiente
            $compraExistente = Compra::where('id_coche', $request->id_coche)
                ->where('id_comprador', $comprador->id)
                ->whereIn('estado', ['PENDIENTE_VENDEDOR', 'PENDIENTE_COMPRADOR'])
                ->first();

            if ($compraExistente) {
                return response()->json([
                    'message' => 'Ya tienes una solicitud de compra pendiente para este coche'
                ], 409);
            }

            // Crear registro de compra
            $compra = Compra::create([
                'id_coche' => $request->id_coche,
                'id_comprador' => $comprador->id,
                'id_vendedor' => $coche->id_usuario,
                'precio_acordado' => $request->precio_acordado,
                'condiciones' => $request->condiciones,
                'estado' => 'PENDIENTE_VENDEDOR',
                'fecha_limite_confirmacion' => now()->addDays(3), // 3 días para responder
                'confirmacion_comprador' => false,
                'confirmacion_vendedor' => false
            ]);

            // Crear conversación si no existe
            if ($request->id_conversacion) {
                $conversacion = Conversacion::find($request->id_conversacion);
            } else {
                $conversacion = Conversacion::firstOrCreate([
                    'id_coche' => $request->id_coche,
                    'id_comprador' => $comprador->id,
                    'id_vendedor' => $coche->id_usuario
                ]);
            }

            // Enviar mensaje automático sobre la solicitud
            $mensaje = \App\Models\Mensaje::create([
                'id_conversacion' => $conversacion->id,
                'id_remitente' => $comprador->id,
                'contenido' => "💰 He enviado una solicitud de compra por {$request->precio_acordado}€. " .
                              ($request->condiciones ? "Condiciones: {$request->condiciones}" : ""),
                'leido' => false
            ]);

            DB::commit();

            // Disparar evento para notificaciones en tiempo real
            broadcast(new PurchaseStatusChanged($compra))->toOthers();

            return response()->json([
                'message' => 'Solicitud de compra enviada correctamente',
                'compra' => $compra->load(['coche', 'comprador', 'vendedor'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al iniciar compra:', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Error al procesar la solicitud de compra',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/compras/{id}/responder-vendedor",
     *     tags={"Compras"},
     *     summary="Vendedor responde a solicitud de compra",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"acepta"},
     *             @OA\Property(property="acepta", type="boolean"),
     *             @OA\Property(property="mensaje", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Respuesta del vendedor procesada")
     * )
     */
    public function responderVendedor(Request $request, $id)
    {
        $request->validate([
            'acepta' => 'required|boolean',
            'mensaje' => 'nullable|string|max:500'
        ]);

        try {
            DB::beginTransaction();

            $compra = Compra::findOrFail($id);
            $usuario = Auth::user();

            // Verificar autorización
            if ($compra->id_vendedor !== $usuario->id) {
                return response()->json(['message' => 'No autorizado'], 403);
            }

            if ($compra->estado !== 'PENDIENTE_VENDEDOR') {
                return response()->json([
                    'message' => 'Esta solicitud ya ha sido procesada'
                ], 400);
            }

            if ($request->acepta) {
                $compra->update([
                    'estado' => 'PENDIENTE_COMPRADOR',
                    'confirmacion_vendedor' => true,
                    'fecha_limite_confirmacion' => now()->addDays(2) // 2 días para que confirme el comprador
                ]);

                $mensajeTexto = "✅ He aceptado tu solicitud de compra por {$compra->precio_acordado}€. " .
                              "Por favor, confirma que estás de acuerdo con las condiciones.";
            } else {
                $compra->update([
                    'estado' => 'CANCELADA',
                    'motivo_cancelacion' => $request->mensaje ?: 'Rechazada por el vendedor'
                ]);

                $mensajeTexto = "❌ He rechazado tu solicitud de compra. " .
                              ($request->mensaje ? "Motivo: {$request->mensaje}" : "");
            }

            // Enviar mensaje automático
            $conversacion = Conversacion::where('id_coche', $compra->id_coche)
                ->where('id_comprador', $compra->id_comprador)
                ->where('id_vendedor', $compra->id_vendedor)
                ->first();

            if ($conversacion) {
                \App\Models\Mensaje::create([
                    'id_conversacion' => $conversacion->id,
                    'id_remitente' => $usuario->id,
                    'contenido' => $mensajeTexto,
                    'leido' => false
                ]);
            }

            DB::commit();

            // Disparar evento
            broadcast(new PurchaseStatusChanged($compra))->toOthers();

            return response()->json([
                'message' => $request->acepta ? 'Solicitud aceptada' : 'Solicitud rechazada',
                'compra' => $compra->load(['coche', 'comprador', 'vendedor'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al responder solicitud:', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Error al procesar la respuesta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/compras/{id}/confirmar-comprador",
     *     tags={"Compras"},
     *     summary="Comprador confirma la compra final",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Compra confirmada exitosamente")
     * )
     */
    public function confirmarComprador($id)
    {
        try {
            DB::beginTransaction();

            $compra = Compra::findOrFail($id);
            $usuario = Auth::user();

            // Verificar autorización
            if ($compra->id_comprador !== $usuario->id) {
                return response()->json(['message' => 'No autorizado'], 403);
            }

            if ($compra->estado !== 'PENDIENTE_COMPRADOR') {
                return response()->json([
                    'message' => 'Esta solicitud no está pendiente de tu confirmación'
                ], 400);
            }

            // Confirmar compra
            $compra->update([
                'estado' => 'CONFIRMADA',
                'confirmacion_comprador' => true,
                'fecha_venta' => now()
            ]);

            // Marcar coche como vendido
            $coche = Coche::findOrFail($compra->id_coche);
            $coche->update(['vendido' => true]);

            // Cancelar otras solicitudes pendientes para este coche
            Compra::where('id_coche', $compra->id_coche)
                ->where('id', '!=', $compra->id)
                ->whereIn('estado', ['PENDIENTE_VENDEDOR', 'PENDIENTE_COMPRADOR'])
                ->update([
                    'estado' => 'CANCELADA',
                    'motivo_cancelacion' => 'Coche vendido a otro comprador'
                ]);

            // Enviar mensaje de confirmación
            $conversacion = Conversacion::where('id_coche', $compra->id_coche)
                ->where('id_comprador', $compra->id_comprador)
                ->where('id_vendedor', $compra->id_vendedor)
                ->first();

            if ($conversacion) {
                \App\Models\Mensaje::create([
                    'id_conversacion' => $conversacion->id,
                    'id_remitente' => $usuario->id,
                    'contenido' => "🎉 ¡Compra confirmada! El coche ahora es mío. ¡Gracias por la venta!",
                    'leido' => false
                ]);
            }

            DB::commit();

            // Disparar evento
            broadcast(new PurchaseStatusChanged($compra))->toOthers();

            return response()->json([
                'message' => '¡Compra confirmada exitosamente! Ahora puedes valorar al vendedor.',
                'compra' => $compra->load(['coche', 'comprador', 'vendedor'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al confirmar compra:', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Error al confirmar la compra',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/compras/mis-compras",
     *     tags={"Compras"},
     *     summary="Obtener compras del usuario (como comprador)",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Lista de compras del usuario")
     * )
     */
    public function misCompras()
    {
        $compras = Compra::with(['coche.marca', 'coche.modelo', 'vendedor', 'valoracion'])
            ->where('id_comprador', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($compras);
    }

    /**
     * @OA\Get(
     *     path="/api/compras/mis-ventas",
     *     tags={"Compras"},
     *     summary="Obtener ventas del usuario (como vendedor)",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Lista de ventas del usuario")
     * )
     */
    public function misVentas()
    {
        $ventas = Compra::with(['coche.marca', 'coche.modelo', 'comprador', 'valoracion'])
            ->where('id_vendedor', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($ventas);
    }

    /**
     * @OA\Delete(
     *     path="/api/compras/{id}",
     *     tags={"Compras"},
     *     summary="Cancelar solicitud de compra",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Solicitud cancelada")
     * )
     */
    public function cancelar(Request $request, $id)
    {
        try {
            $compra = Compra::findOrFail($id);
            $usuario = Auth::user();

            // Verificar autorización (solo el comprador puede cancelar)
            if ($compra->id_comprador !== $usuario->id) {
                return response()->json(['message' => 'No autorizado'], 403);
            }

            if (!in_array($compra->estado, ['PENDIENTE_VENDEDOR', 'PENDIENTE_COMPRADOR'])) {
                return response()->json([
                    'message' => 'Esta solicitud no se puede cancelar'
                ], 400);
            }

            $compra->update([
                'estado' => 'CANCELADA',
                'motivo_cancelacion' => 'Cancelada por el comprador'
            ]);

            return response()->json([
                'message' => 'Solicitud de compra cancelada'
            ]);

        } catch (\Exception $e) {
            Log::error('Error al cancelar compra:', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Error al cancelar la solicitud',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
