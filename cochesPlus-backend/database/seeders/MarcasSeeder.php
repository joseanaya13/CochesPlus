<?php

namespace Database\Seeders;

use App\Models\Marca;
use Illuminate\Database\Seeder;

class MarcasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $marcas = [
            'Alfa Romeo',
            'Audi',
            'BMW',
            'Chevrolet',
            'Citroën',
            'Dacia',
            'Ferrari',
            'Fiat',
            'Ford',
            'Honda',
            'Hyundai',
            'Jaguar',
            'Jeep',
            'Kia',
            'Lamborghini',
            'Land Rover',
            'Lexus',
            'Mazda',
            'Mercedes-Benz',
            'Mini',
            'Nissan',
            'Opel',
            'Peugeot',
            'Porsche',
            'Renault',
            'Seat',
            'Skoda',
            'Tesla',
            'Toyota',
            'Volkswagen',
            'Volvo'
        ];

        foreach ($marcas as $marca) {
            Marca::create(['nombre' => $marca]);
        }
    }
}
