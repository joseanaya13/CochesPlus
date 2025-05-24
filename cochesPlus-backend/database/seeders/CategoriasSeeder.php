<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categorias = [
            'Sedán',
            'SUV',
            'Deportivo',
            'Hatchback',
            'Pickup',
            'Coupé',
            'Convertible',
            'Familiar',
            'Eléctrico',
            'Compacto',
            'Berlina',
            'Todoterreno',
            'Monovolumen',
            'Limousina',
            'Cabrio',
            'Roadster',
            'Camión',
            'Furgoneta',
            'Clásico',
            'Motocicleta'
        ];

        foreach ($categorias as $categoria) {
            Categoria::create(['nombre' => $categoria]);
        }
    }
}
