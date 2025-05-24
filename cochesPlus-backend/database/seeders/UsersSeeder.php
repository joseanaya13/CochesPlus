<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::factory()->create([
            'nombre' => 'Administrador',
            'email' => 'admin@cochesplus.com',
            'password' => Hash::make('admin1234'),
            'telefono' => '666777888',
            'direccion' => 'Calle Admin 123',
        ]);

        $admin->assignRole('admin');

        // $comprador = User::factory()->create([
        //     'nombre' => 'Comprador Test',
        //     'email' => 'comprador@example.com',
        //     'password' => Hash::make('password'),
        //     'telefono' => '999888777',
        //     'direccion' => 'Calle Test 456',
        // ]);

        // $comprador->assignRole('comprador');

        // $vendedor = User::factory()->create([
        //     'nombre' => 'Vendedor Test',
        //     'email' => 'vendedor@example.com',
        //     'password' => Hash::make('password'),
        //     'telefono' => '666555444',
        //     'direccion' => 'Calle Vendedor 789',
        // ]);

        // $vendedor->assignRole('vendedor');

        $multirol = User::factory()->create([
            'nombre' => 'Usuario Multirol',
            'email' => 'multirol@example.com',
            'password' => Hash::make('password'),
            'telefono' => '777888999',
            'direccion' => 'Calle Multirol, 123',
        ]);

        $multirol->assignRole(['comprador', 'vendedor']);
    }
}
