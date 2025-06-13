<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{

    /**
     * @OA\Post(
     *     path="/api/login",
     *     tags={"Auth"},
     *     summary="Iniciar sesión de usuario",
     *     description="Permite a un usuario iniciar sesión proporcionando su correo electrónico y contraseña. Devuelve un token de autenticación y los roles del usuario.",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email", "password"},
     *             @OA\Property(property="email", type="string", format="email", example="usuario@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Inicio de sesión exitoso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Inicio de sesión exitoso"),
     *             @OA\Property(property="user", type="object", example={"id": 1, "name": "Usuario Ejemplo", "email": "usuario@example.com"}),
     *             @OA\Property(property="roles", type="array", @OA\Items(type="string"), example={"admin", "comprador", "vendedor", "invitado"}),
     *             @OA\Property(property="token", type="string", example="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Credenciales incorrectas",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Credenciales incorrectas")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Error de validación"),
     *             @OA\Property(property="errors", type="object", example={"email": {"El campo email es obligatorio."}, "password": {"El campo password es obligatorio."}})
     *         )
     *     )
     * )
     */
    public function login(Request $request)
    {
        // Registrar solicitud para depuración
        Log::info('Solicitud de login recibida', [
            'email' => $request->email,
            'ip' => $request->ip()
        ]);

        $validator = Validator::make($request->all(), [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required' => 'El correo electrónico es obligatorio',
            'email.string' => 'El correo electrónico debe ser un texto',
            'email.email' => 'Debe ingresar un correo electrónico válido',
            'password.required' => 'La contraseña es obligatoria',
            'password.string' => 'La contraseña debe ser un texto'
        ]);

        if ($validator->fails()) {
            Log::warning('Validación de login fallida', ['errors' => $validator->errors()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            Log::warning('Intento de login fallido', ['email' => $request->email]);
            return response()->json([
                'status' => 'error',
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        $roles = $user->getRoleNames()->toArray();
        $token = $user->createToken('auth_token', $roles, now()->addHours(24))->plainTextToken;

        Log::info('Login exitoso', ['user_id' => $user->id]);

        return response()->json([
            'status' => 'success',
            'message' => 'Inicio de sesión exitoso',
            'user' => $user,
            'roles' => $user->getRoleNames(),
            'token' => $token
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/register",
     *     tags={"Auth"},
     *     summary="Registrar nuevo usuario",
     *     description="Permite registrar un nuevo usuario en el sistema. Devuelve el usuario creado y un token de autenticación.",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "email", "password", "password_confirmation"},
     *             @OA\Property(property="name", type="string", example="Nombre Usuario"),
     *             @OA\Property(property="email", type="string", format="email", example="nuevo@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="Password123!"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="Password123!"),
     *             @OA\Property(property="telefono", type="string", example="123456789"),
     *             @OA\Property(property="direccion", type="string", example="Calle Ejemplo, 123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Usuario registrado correctamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Usuario registrado correctamente"),
     *             @OA\Property(property="user", type="object", example={"id": 1, "name": "Nombre Usuario", "email": "nuevo@example.com"}),
     *             @OA\Property(property="token", type="string", example="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Los datos proporcionados no son válidos"),
     *             @OA\Property(property="errors", type="object", example={
     *                 "name": {"El campo nombre es obligatorio"},
     *                 "email": {"El correo ya está en uso"},
     *                 "password": {"La contraseña debe tener al menos 8 caracteres"}
     *             })
     *         )
     *     )
     * )
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:150', 'unique:usuarios'],
            'password' => ['required', 'confirmed', 'string', 'min:8'],
            'telefono' => ['nullable', 'string', 'max:20'],
            'direccion' => ['nullable', 'string', 'max:255'],
        ], [
            'nombre.required' => 'El nombre es obligatorio',
            'nombre.string' => 'El nombre debe ser un texto',
            'nombre.max' => 'El nombre no puede tener más de 100 caracteres',
            'email.required' => 'El correo electrónico es obligatorio',
            'email.string' => 'El correo electrónico debe ser un texto',
            'email.email' => 'Debe ingresar un correo electrónico válido',
            'email.max' => 'El correo no puede tener más de 150 caracteres',
            'email.unique' => 'Este correo electrónico ya está registrado',
            'password.required' => 'La contraseña es obligatoria',
            'password.confirmed' => 'Las contraseñas no coinciden',
            'telefono.string' => 'El teléfono debe ser un texto',
            'telefono.max' => 'El teléfono no puede tener más de 20 caracteres',
            'direccion.string' => 'La dirección debe ser un texto',
            'direccion.max' => 'La dirección no puede tener más de 255 caracteres',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'nombre' => $request->nombre,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'telefono' => $request->telefono,
            'direccion' => $request->direccion,
        ]);

        if (method_exists($user, 'assignRole')) {
            $user->assignRole(['comprador', 'vendedor']);
        }

        $roles = $user->getRoleNames()->toArray();
        $token = $user->createToken('auth_token', $roles, now()->addHours(24))->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Usuario registrado correctamente',
            'user' => $user,
            'roles' => $user->getRoleNames(),
            'token' => $token
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/api/logout",
     *     tags={"Auth"},
     *     summary="Cerrar sesión de usuario",
     *     description="Invalida el token de autenticación actual del usuario",
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Logout exitoso",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Logout exitoso")
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
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logout exitoso'
        ]);
    }

    public function validateCurrentUser(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'No autenticado'
            ], 401);
        }

        // Obtener roles directamente de la base de datos
        $currentRoles = $user->getRoleNames();

        return response()->json([
            'user' => $user,
            'roles' => $currentRoles,
            'is_admin' => $user->hasRole('admin'),
            'is_vendedor' => $user->hasRole('vendedor'),
            'is_comprador' => $user->hasRole('comprador')
        ]);
    }
}
