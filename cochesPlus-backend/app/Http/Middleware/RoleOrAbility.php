<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleOrAbility
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        foreach ($roles as $role) {
            // Verificar token primero (rápido)
            if ($user->tokenCan($role)) {
                return $next($request);
            }

            // Verificar en DB si es necesario
            if ($user->hasRole($role)) {
                // Opcional: renovar token si está desactualizado
                return $next($request);
            }
        }

        return response()->json([
            'message' => 'Acceso denegado. No tienes los permisos necesarios.'
        ], 403);
    }
}
