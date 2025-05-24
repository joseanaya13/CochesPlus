<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            UsersSeeder::class,
            CategoriasSeeder::class,
            MarcasSeeder::class,
            ProvinciasSeeder::class,
            ModelosSeeder::class,
            FaqsSeeder::class,
            CochesSeeder::class,
        ]);
    }
}
