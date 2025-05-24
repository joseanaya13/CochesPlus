<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class PasswordResetController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/forgot-password",
     *     tags={"Auth"},
     *     summary="Enviar enlace de recuperación de contraseña",
     *     description="Envía un correo electrónico con un enlace para restablecer la contraseña",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email"},
     *             @OA\Property(property="email", type="string", format="email", example="usuario@example.com")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Enlace enviado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="Enlace de recuperación enviado.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Error al enviar el enlace",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="No se pudo enviar el enlace.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="El campo email es obligatorio"),
     *             @OA\Property(property="errors", type="object", example={"email": {"El campo email es obligatorio"}})
     *         )
     *     )
     * )
     */
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:usuarios,email'],
        ]);

        try {
            // Registrar información sobre el intento de recuperación
            Log::info('Intento de recuperación de contraseña para: ' . $request->email);
            Log::info('Usando broker de contraseñas: ' . config('auth.defaults.passwords'));

            // Especificar el broker 'usuarios' explícitamente (según configuración en auth.php)
            $status = Password::broker('usuarios')->sendResetLink(
                $request->only('email')
            );

            Log::info('Resultado del envío: ' . $status);

            return $status === Password::RESET_LINK_SENT
                ? response()->json(['status' => 'Enlace de recuperación enviado.'])
                : response()->json(['error' => 'No se pudo enviar el enlace.'], 500);
        } catch (\Throwable $e) {
            Log::error('Error al enviar email de recuperación: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Ocurrió un error interno.'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/reset-password",
     *     tags={"Auth"},
     *     summary="Restablecer contraseña",
     *     description="Restablece la contraseña del usuario utilizando el token enviado por correo",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email", "token", "password", "password_confirmation"},
     *             @OA\Property(property="email", type="string", format="email", example="usuario@example.com"),
     *             @OA\Property(property="token", type="string", example="1a2b3c4d5e6f7g8h9i0j"),
     *             @OA\Property(property="password", type="string", format="password", example="NuevaPassword123!"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="NuevaPassword123!")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Contraseña restablecida exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="Contraseña restablecida correctamente.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Token inválido o error de validación",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Token inválido o expirado.")
     *         )
     *     )
     * )
     */
    public function reset(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:usuarios,email',
            'token' => 'required|string',
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        try {
            // Registrar información sobre el intento de restablecimiento
            Log::info('Intento de restablecimiento de contraseña para: ' . $request->email);

            // Especificar el broker 'usuarios' explícitamente
            $status = Password::broker('usuarios')->reset(
                $request->only(['email', 'password', 'password_confirmation', 'token']),
                function ($user, $password) {
                    Log::info('Actualizando contraseña para usuario: ' . $user->email);
                    $user->forceFill([
                        'password' => Hash::make($password),
                    ])->save();

                    // Opcional: Revocar todos los tokens existentes
                    $user->tokens()->delete();
                }
            );

            Log::info('Resultado del restablecimiento: ' . $status);

            return $status === Password::PASSWORD_RESET
                ? response()->json(['status' => 'Contraseña restablecida correctamente.'])
                : response()->json(['error' => 'Token inválido o expirado.'], 422);
        } catch (\Throwable $e) {
            Log::error('Error al restablecer contraseña: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Ocurrió un error interno al restablecer contraseña.'], 500);
        }
    }
}
