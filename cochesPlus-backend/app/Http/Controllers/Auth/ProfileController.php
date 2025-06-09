<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/profile",
     *     tags={"Perfil"},
     *     summary="Obtener perfil del usuario",
     *     description="Devuelve la información del perfil del usuario autenticado",
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Datos del perfil",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="user", type="object", example={
     *                 "id": 1,
     *                 "nombre": "Nombre Usuario",
     *                 "email": "usuario@example.com",
     *                 "telefono": "123456789",
     *                 "direccion": "Calle Ejemplo, 123"
     *             })
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autorizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     )
     * )
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();

        // Cargar solo los datos que necesitamos para el perfil
        $userProfile = User::select('id', 'nombre', 'email', 'telefono', 'direccion', 'created_at', 'updated_at')
            ->where('id', $user->id)
            ->first();

        return response()->json([
            'status' => 'success',
            'user' => $userProfile
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/profile",
     *     tags={"Perfil"},
     *     summary="Actualizar perfil del usuario",
     *     description="Actualiza la información del perfil del usuario autenticado",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="nombre", type="string", example="Nombre Actualizado"),
     *             @OA\Property(property="telefono", type="string", example="987654321"),
     *             @OA\Property(property="direccion", type="string", example="Nueva Dirección, 456")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Perfil actualizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Perfil actualizado correctamente"),
     *             @OA\Property(property="user", type="object", example={
     *                 "id": 1,
     *                 "nombre": "Nombre Actualizado",
     *                 "email": "usuario@example.com",
     *                 "telefono": "987654321",
     *                 "direccion": "Nueva Dirección, 456"
     *             })
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Error de validación"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autorizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     )
     * )
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        Log::info('Actualización de perfil solicitada', [
            'user_id' => $user->id,
            'data' => $request->except(['password', 'password_confirmation'])
        ]);

        $validator = Validator::make($request->all(), [
            'nombre' => ['sometimes', 'string', 'max:100'],
            'telefono' => ['nullable', 'string', 'max:20'],
            'direccion' => ['nullable', 'string', 'max:255'],
        ], [
            'nombre.string' => 'El nombre debe ser un texto',
            'nombre.max' => 'El nombre no puede tener más de 100 caracteres',
            'telefono.string' => 'El teléfono debe ser un texto',
            'telefono.max' => 'El teléfono no puede tener más de 20 caracteres',
            'direccion.string' => 'La dirección debe ser un texto',
            'direccion.max' => 'La dirección no puede tener más de 255 caracteres',
        ]);

        if ($validator->fails()) {
            Log::warning('Validación fallida al actualizar perfil', ['errors' => $validator->errors()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Actualizar solo los campos enviados
            $userData = $request->only(['nombre', 'telefono', 'direccion']);
            $user->fill($userData);
            $user->save();

            Log::info('Perfil actualizado correctamente', ['user_id' => $user->id]);

            return response()->json([
                'status' => 'success',
                'message' => 'Perfil actualizado correctamente',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            Log::error('Error al actualizar perfil', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Error al actualizar el perfil'
            ], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/profile/password",
     *     tags={"Perfil"},
     *     summary="Cambiar contraseña del usuario",
     *     description="Permite al usuario cambiar su contraseña proporcionando la actual y la nueva",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"current_password", "password", "password_confirmation"},
     *             @OA\Property(property="current_password", type="string", format="password", example="PasswordActual123"),
     *             @OA\Property(property="password", type="string", format="password", example="NuevaPassword123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="NuevaPassword123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Contraseña cambiada",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Contraseña cambiada correctamente")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Error de validación"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autorizado o contraseña actual incorrecta",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="La contraseña actual es incorrecta")
     *         )
     *     )
     * )
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        Log::info('Cambio de contraseña solicitado', ['user_id' => $user->id]);

        $validator = Validator::make($request->all(), [
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'current_password.required' => 'La contraseña actual es obligatoria',
            'password.required' => 'La nueva contraseña es obligatoria',
            'password.min' => 'La nueva contraseña debe tener al menos 8 caracteres',
            'password.confirmed' => 'La confirmación de la nueva contraseña no coincide',
        ]);

        if ($validator->fails()) {
            Log::warning('Validación fallida al cambiar contraseña', ['errors' => $validator->errors()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar la contraseña actual
        if (!Hash::check($request->current_password, $user->password)) {
            Log::warning('Intento de cambio de contraseña con contraseña actual incorrecta', ['user_id' => $user->id]);
            return response()->json([
                'status' => 'error',
                'message' => 'La contraseña actual es incorrecta'
            ], 401);
        }

        try {
            // Cambiar la contraseña
            $user->password = Hash::make($request->password);
            $user->save();

            // Opcional: Revocar todos los tokens excepto el actual para forzar cierre de sesión en otros dispositivos
            // $user->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();

            Log::info('Contraseña cambiada correctamente', ['user_id' => $user->id]);

            return response()->json([
                'status' => 'success',
                'message' => 'Contraseña cambiada correctamente'
            ]);
        } catch (\Exception $e) {
            Log::error('Error al cambiar contraseña', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Error al cambiar la contraseña'
            ], 500);
        }
    }
}
