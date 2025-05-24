<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {

        $roles = ['admin', 'vendedor', 'comprador', 'invitado'];
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }

        $permissions = [
            'usuarios' => [
                'gestionar usuarios',
                'ver usuarios',
                'editar usuarios',
                'eliminar usuarios'
            ],
            'anuncios' => [
                'gestionar anuncios',
                'publicar anuncio',
                'editar anuncio',
                'eliminar anuncio',
                'marcar como vendido',
                'destacar anuncio'
            ],
            'documentos' => [
                'subir documentos',
                'verificar documentos',
                'ver documentos'
            ],
            'visualizacion' => [
                'buscar coches',
                'ver detalles coche'
            ],
            'favoritos' => [
                'marcar favorito',
                'ver favoritos',
                'eliminar favorito'
            ],
            'mensajes' => [
                'enviar mensaje',
                'responder mensaje',
                'gestionar mensajes',
                'eliminar mensaje'
            ],
            'valoraciones' => [
                'valorar vendedor',
                'ver valoraciones',
                'gestionar valoraciones'
            ]
        ];

        foreach ($permissions as $grupo) {
            foreach ($grupo as $permiso) {
                Permission::firstOrCreate(['name' => $permiso, 'guard_name' => 'web']);
            }
        }

        $admin = Role::where('name', 'admin')->first();
        $vendedor = Role::where('name', 'vendedor')->first();
        $comprador = Role::where('name', 'comprador')->first();
        $invitado = Role::where('name', 'invitado')->first();

        $admin->givePermissionTo(Permission::all());

        $vendedor->givePermissionTo([
            'publicar anuncio',
            'editar anuncio',
            'eliminar anuncio',
            'marcar como vendido',
            'subir documentos',
            'ver documentos',
            'buscar coches',
            'ver detalles coche',
            'enviar mensaje',
            'responder mensaje',
            'ver valoraciones'
        ]);

        $comprador->givePermissionTo([
            'buscar coches',
            'ver detalles coche',
            'marcar favorito',
            'ver favoritos',
            'eliminar favorito',
            'enviar mensaje',
            'responder mensaje',
            'valorar vendedor',
            'ver valoraciones'
        ]);

        $invitado->givePermissionTo([
            'buscar coches',
            'ver detalles coche'
        ]);
    }
}
