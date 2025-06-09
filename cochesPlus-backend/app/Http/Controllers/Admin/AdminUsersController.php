<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role;

class AdminUsersController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/admin/users",
     *     tags={"Admin - Usuarios"},
     *     summary="Lista todos los usuarios del sistema",
     *     description="Obtiene una lista paginada de usuarios con filtros de búsqueda",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="page", in="query", description="Número de página", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="per_page", in="query", description="Elementos por página", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="search", in="query", description="Buscar por nombre o email", @OA\Schema(type="string")),
     *     @OA\Parameter(name="role", in="query", description="Filtrar por rol", @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de usuarios",
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
        $consulta = User::with(['roles']);

        // Filtro de búsqueda
        if ($solicitud->has('search') && $solicitud->search) {
            $busqueda = $solicitud->search;
            $consulta->where(function ($q) use ($busqueda) {
                $q->where('nombre', 'like', "%{$busqueda}%")
                    ->orWhere('email', 'like', "%{$busqueda}%");
            });
        }

        // Filtro por rol
        if ($solicitud->has('role') && $solicitud->role) {
            $consulta->whereHas('roles', function ($q) use ($solicitud) {
                $q->where('name', $solicitud->role);
            });
        }

        // Ordenar por fecha de creación (más recientes primero)
        $consulta->orderBy('created_at', 'desc');

        $usuarios = $consulta->paginate($solicitud->get('per_page', 15));

        // Transformar los datos para incluir información adicional
        $usuarios->getCollection()->transform(function ($usuario) {
            return [
                'id' => $usuario->id,
                'nombre' => $usuario->nombre,
                'email' => $usuario->email,
                'telefono' => $usuario->telefono,
                'direccion' => $usuario->direccion,
                'roles' => $usuario->roles->pluck('name'),
                'email_verificado_en' => $usuario->email_verified_at,
                'creado_en' => $usuario->created_at,
                'actualizado_en' => $usuario->updated_at,
                'cantidad_anuncios' => $usuario->coches()->count(),
                'cantidad_conversaciones' => $usuario->conversacionesComoComprador()->count() + $usuario->conversacionesComoVendedor()->count(),
                'ultimo_acceso' => $usuario->updated_at
            ];
        });

        return response()->json([
            'exito' => true,
            'mensaje' => 'Lista de usuarios obtenida correctamente',
            'datos' => $usuarios
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/users/{id}",
     *     tags={"Admin - Usuarios"},
     *     summary="Obtiene detalles de un usuario específico",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Detalles del usuario"),
     *     @OA\Response(response=404, description="Usuario no encontrado")
     * )
     */
    public function mostrar($id)
    {
        $usuario = User::with(['roles', 'coches', 'conversacionesComoComprador', 'conversacionesComoVendedor'])
            ->findOrFail($id);

        return response()->json([
            'exito' => true,
            'mensaje' => 'Detalles del usuario obtenidos correctamente',
            'datos' => [
                'id' => $usuario->id,
                'nombre' => $usuario->nombre,
                'email' => $usuario->email,
                'telefono' => $usuario->telefono,
                'direccion' => $usuario->direccion,
                'roles' => $usuario->roles->pluck('name'),
                'email_verificado_en' => $usuario->email_verified_at,
                'creado_en' => $usuario->created_at,
                'actualizado_en' => $usuario->updated_at,
                'estadisticas' => [
                    'anuncios_totales' => $usuario->coches->count(),
                    'anuncios_activos' => $usuario->coches->where('vendido', false)->count(),
                    'anuncios_vendidos' => $usuario->coches->where('vendido', true)->count(),
                    'conversaciones_como_comprador' => $usuario->conversacionesComoComprador->count(),
                    'conversaciones_como_vendedor' => $usuario->conversacionesComoVendedor->count(),
                ],
                'anuncios_recientes' => $usuario->coches()->with(['marca', 'modelo'])->latest()->take(5)->get(),
            ]
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/admin/users",
     *     tags={"Admin - Usuarios"},
     *     summary="Crear nuevo usuario",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nombre", "email", "password", "roles"},
     *             @OA\Property(property="nombre", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string"),
     *             @OA\Property(property="telefono", type="string"),
     *             @OA\Property(property="direccion", type="string"),
     *             @OA\Property(property="roles", type="array", @OA\Items(type="string"))
     *         )
     *     ),
     *     @OA\Response(response=201, description="Usuario creado"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    public function crear(Request $solicitud)
    {
        $validador = Validator::make($solicitud->all(), [
            'nombre' => 'required|string|max:100',
            'email' => 'required|string|email|max:150|unique:usuarios',
            'password' => 'required|string|min:8',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:255',
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,name'
        ], [
            'nombre.required' => 'El nombre es obligatorio',
            'email.required' => 'El email es obligatorio',
            'email.unique' => 'Este email ya está registrado',
            'password.required' => 'La contraseña es obligatoria',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres',
            'roles.required' => 'Debe asignar al menos un rol',
            'roles.*.exists' => 'Rol no válido'
        ]);

        if ($validador->fails()) {
            return response()->json([
                'exito' => false,
                'mensaje' => 'Error de validación',
                'errores' => $validador->errors()
            ], 422);
        }

        $usuario = User::create([
            'nombre' => $solicitud->nombre,
            'email' => $solicitud->email,
            'password' => Hash::make($solicitud->password),
            'telefono' => $solicitud->telefono,
            'direccion' => $solicitud->direccion,
        ]);

        $usuario->assignRole($solicitud->roles);

        return response()->json([
            'exito' => true,
            'mensaje' => 'Usuario creado correctamente',
            'datos' => $usuario->load('roles')
        ], 201);
    }

    /**
     * @OA\Put(
     *     path="/api/admin/users/{id}",
     *     tags={"Admin - Usuarios"},
     *     summary="Actualizar usuario",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="nombre", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="telefono", type="string"),
     *             @OA\Property(property="direccion", type="string"),
     *             @OA\Property(property="roles", type="array", @OA\Items(type="string"))
     *         )
     *     ),
     *     @OA\Response(response=200, description="Usuario actualizado"),
     *     @OA\Response(response=404, description="Usuario no encontrado")
     * )
     */
    public function actualizar(Request $solicitud, $id)
    {
        $usuario = User::findOrFail($id);

        $validador = Validator::make($solicitud->all(), [
            'nombre' => 'sometimes|required|string|max:100',
            'email' => 'sometimes|required|string|email|max:150|unique:usuarios,email,' . $id,
            'password' => 'sometimes|nullable|string|min:8',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:255',
            'roles' => 'sometimes|required|array',
            'roles.*' => 'exists:roles,name'
        ]);

        if ($validador->fails()) {
            return response()->json([
                'exito' => false,
                'mensaje' => 'Error de validación',
                'errores' => $validador->errors()
            ], 422);
        }

        $datos = $solicitud->only(['nombre', 'email', 'telefono', 'direccion']);

        if ($solicitud->has('password') && $solicitud->password) {
            $datos['password'] = Hash::make($solicitud->password);
        }

        $usuario->update($datos);

        if ($solicitud->has('roles')) {
            $usuario->syncRoles($solicitud->roles);
        }

        return response()->json([
            'exito' => true,
            'mensaje' => 'Usuario actualizado correctamente',
            'datos' => $usuario->load('roles')
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/admin/users/{id}",
     *     tags={"Admin - Usuarios"},
     *     summary="Eliminar usuario",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Usuario eliminado"),
     *     @OA\Response(response=404, description="Usuario no encontrado")
     * )
     */
    public function eliminar($id)
    {
        $usuario = User::findOrFail($id);

        // Verificar que no sea el último administrador
        if ($usuario->hasRole('admin')) {
            $cantidadAdmins = User::role('admin')->count();
            if ($cantidadAdmins <= 1) {
                return response()->json([
                    'exito' => false,
                    'mensaje' => 'No se puede eliminar el último administrador del sistema'
                ], 400);
            }
        }

        // Eliminar usuario (esto también eliminará sus relaciones debido a las foreign keys)
        $usuario->delete();

        return response()->json([
            'exito' => true,
            'mensaje' => 'Usuario eliminado correctamente'
        ]);
    }
}
