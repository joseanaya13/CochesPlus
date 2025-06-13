<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RoleOrAbility
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user) {
            Log::warning('Usuario no autenticado intentando acceder a ruta protegida', [
                'route' => $request->path(),
                'ip' => $request->ip()
            ]);

            return response()->json([
                'message' => 'No autenticado. Debes iniciar sesión.'
            ], 401);
        }

        Log::info('Verificando permisos de usuario', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'required_roles' => $roles,
            'user_roles' => $user->getRoleNames(),
            'route' => $request->path()
        ]);

        $hasRole = false;
        foreach ($roles as $role) {
            // IMPORTANTE: Solo verificar en la base de datos, NO en el token
            if ($user->hasRole($role)) {
                $hasRole = true;
                Log::info('Usuario autorizado', [
                    'user_id' => $user->id,
                    'role' => $role,
                    'route' => $request->path()
                ]);
                break;
            }
        }

        if (!$hasRole) {
            Log::warning('Acceso denegado por falta de permisos', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'required_roles' => $roles,
                'user_roles' => $user->getRoleNames(),
                'route' => $request->path(),
                'ip' => $request->ip()
            ]);

            return response()->json([
                'message' => 'Acceso denegado. No tienes los permisos necesarios.',
                'required_roles' => $roles,
                'your_roles' => $user->getRoleNames()
            ], 403);
        }

        return $next($request);
    }
}
