<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class ProvinciasSeeder extends Seeder
{
    protected $geonamesUsername = 'jmariafa41';

    public function run(): void
    {
        try {
            $username = Config::get('services.geonames.username') ??
                env('GEONAMES_USERNAME', $this->geonamesUsername);

            $this->command->info("Intentando conectar a GeoNames con el usuario: $username");

            $response = Http::get('http://api.geonames.org/searchJSON', [
                'country' => 'ES',
                'featureCode' => 'ADM2',
                'username' => $username,
                'lang' => 'es',
                'maxRows' => 60
            ]);

            if ($response->successful()) {
                $this->procesarRespuestaGeoNames($response->json());
            } else {
                $this->command->error('Error al conectar con la API de GeoNames: ' . $response->status());
                $this->insertarProvinciasRespaldo();
            }
        } catch (\Exception $e) {
            $this->command->error('Excepción al conectar con GeoNames: ' . $e->getMessage());
            Log::error('Error en ProvinciasSeeder: ' . $e->getMessage());
            $this->insertarProvinciasRespaldo();
        }
    }

    /**
     * Procesar la respuesta de GeoNames
     */
    private function procesarRespuestaGeoNames($data): void
    {
        $provincias = [];

        if (isset($data['geonames']) && is_array($data['geonames'])) {
            $now = now();

            foreach ($data['geonames'] as $provincia) {
                if (isset($provincia['name'])) {
                    $provincias[] = [
                        'nombre' => $provincia['name'],
                        'created_at' => $now,
                        'updated_at' => $now
                    ];
                }
            }

            if (!empty($provincias)) {
                $provinciasUnicas = collect($provincias)
                    ->unique('nombre')
                    ->sortBy('nombre')
                    ->values()
                    ->all();

                DB::table('provincias')->insert($provinciasUnicas);
                $this->command->info('Se han insertado ' . count($provinciasUnicas) . ' provincias desde GeoNames.');
            } else {
                $this->command->warn('No se encontraron provincias en la respuesta de GeoNames.');
                $this->insertarProvinciasRespaldo();
            }
        } else {
            $this->command->error('La estructura de la respuesta de GeoNames no es válida.');
            $this->insertarProvinciasRespaldo();
        }
    }

    /**
     * Insertar provincias de respaldo en caso de que falle la API
     */
    private function insertarProvinciasRespaldo(): void
    {
        $this->command->info('Insertando provincias desde datos de respaldo...');

        DB::table('provincias')->insert([
            ['nombre' => 'A Coruña', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Álava', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Albacete', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Alicante', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Almería', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Asturias', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Ávila', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Badajoz', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Barcelona', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Burgos', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Cáceres', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Cádiz', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Cantabria', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Castellón', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Ciudad Real', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Córdoba', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Cuenca', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Girona', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Granada', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Guadalajara', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Guipúzcoa', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Huelva', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Huesca', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Islas Baleares', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Jaén', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'La Rioja', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Las Palmas', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'León', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Lleida', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Lugo', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Madrid', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Málaga', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Murcia', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Navarra', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Ourense', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Palencia', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Pontevedra', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Salamanca', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Santa Cruz de Tenerife', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Segovia', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Sevilla', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Soria', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Tarragona', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Teruel', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Toledo', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Valencia', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Valladolid', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Vizcaya', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Zamora', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Zaragoza', 'created_at' => now(), 'updated_at' => now()],

            ['nombre' => 'Ceuta', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Melilla', 'created_at' => now(), 'updated_at' => now()]
        ]);

        $this->command->info('Se han insertado 52 provincias desde datos de respaldo.');
    }
}
