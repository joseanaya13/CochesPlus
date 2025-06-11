<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ModelosSeeder extends Seeder
{
    /**
     * La API de NHTSA para obtener modelos por marca
     */
    protected $apiUrl = 'https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/';

    /**
     * Número mínimo de modelos aceptables de la API
     */
    protected $minModelosRequeridos = 5;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $marcas = DB::table('marcas')->select('id', 'nombre')->get();

        if ($marcas->isEmpty()) {
            $this->command->error('No hay marcas en la base de datos. Ejecuta primero el seeder de marcas.');
            return;
        }

        $totalModelosInsertados = 0;

        foreach ($marcas as $marca) {
            $this->command->info("Obteniendo modelos para {$marca->nombre}...");

            try {
                // Configurar HTTP client para evitar problemas SSL
                $response = Http::withOptions([
                    'verify' => false, // Desactivar verificación SSL temporalmente
                    'timeout' => 30,
                ])->get($this->apiUrl . urlencode($marca->nombre) . '?format=json');

                if ($response->successful()) {
                    $data = $response->json();
                    $modelos = [];
                    $now = now();

                    if (isset($data['Results']) && !empty($data['Results'])) {
                        foreach ($data['Results'] as $item) {
                            if (isset($item['Model_Name']) && !empty($item['Model_Name'])) {
                                $modelos[] = [
                                    'id_marca' => $marca->id,
                                    'nombre' => $item['Model_Name'],
                                    'created_at' => $now,
                                    'updated_at' => $now
                                ];
                            }
                        }

                        $modelosUnicos = collect($modelos)
                            ->unique('nombre')
                            ->values()
                            ->all();

                        $modelosAgregados = count($modelosUnicos);

                        if (!empty($modelosUnicos) && $modelosAgregados >= $this->minModelosRequeridos) {
                            DB::table('modelos')->insert($modelosUnicos);
                            $totalModelosInsertados += $modelosAgregados;
                            $this->command->info("Se han insertado {$modelosAgregados} modelos únicos para {$marca->nombre}");
                        } else {
                            $this->command->warn("Se encontraron menos de {$this->minModelosRequeridos} modelos únicos para {$marca->nombre} ({$modelosAgregados}). Usando datos de respaldo...");
                            $this->insertarModelosRespaldo($marca->id, $marca->nombre);
                        }
                    } else {
                        $this->command->warn("La API no devolvió modelos para {$marca->nombre}");
                        $this->insertarModelosRespaldo($marca->id, $marca->nombre);
                    }
                } else {
                    $this->command->error("Error al consultar la API para {$marca->nombre}: " . $response->status());
                    $this->insertarModelosRespaldo($marca->id, $marca->nombre);
                }
            } catch (\Exception $e) {
                $this->command->error("Excepción al procesar modelos para {$marca->nombre}: " . $e->getMessage());
                Log::error("Error en ModelosSeeder para {$marca->nombre}: " . $e->getMessage());
                $this->insertarModelosRespaldo($marca->id, $marca->nombre);
            }
        }

        $this->command->info("Proceso completado. Se insertaron un total de {$totalModelosInsertados} modelos.");
    }

    /**
     * Inserta modelos de respaldo para una marca específica
     */
    private function insertarModelosRespaldo($marcaId, $marcaNombre): void
    {
        $this->command->info("Insertando modelos de respaldo para {$marcaNombre}...");

        // Modelos específicos por marca más realistas
        $modelosPorMarca = [
            'Alfa Romeo' => ['Giulia', 'Stelvio', 'Giulietta', 'MiTo', 'Tonale', '4C'],
            'Audi' => ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'TT', 'A1'],
            'BMW' => ['Serie 1', 'Serie 3', 'Serie 5', 'X1', 'X3', 'X5', 'Z4', 'i3'],
            'Chevrolet' => ['Spark', 'Cruze', 'Malibu', 'Equinox', 'Tahoe', 'Camaro'],
            'Citroën' => ['C3', 'C4', 'C5', 'Berlingo', 'Picasso', 'DS3'],
            'Dacia' => ['Sandero', 'Duster', 'Logan', 'Lodgy', 'Dokker', 'Spring'],
            'Ferrari' => ['488', 'F8', 'Portofino', 'Roma', 'SF90', 'California'],
            'Fiat' => ['500', 'Panda', 'Punto', 'Tipo', 'Doblo', '500X'],
            'Ford' => ['Fiesta', 'Focus', 'Mondeo', 'Kuga', 'Mustang', 'Transit'],
            'Honda' => ['Civic', 'Accord', 'CR-V', 'HR-V', 'Jazz', 'Pilot'],
            'Hyundai' => ['i10', 'i20', 'i30', 'Tucson', 'Santa Fe', 'Kona'],
            'Jaguar' => ['XE', 'XF', 'F-PACE', 'E-PACE', 'I-PACE', 'F-TYPE'],
            'Jeep' => ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Gladiator'],
            'Kia' => ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Sorento', 'Stonic'],
            'Lamborghini' => ['Huracán', 'Aventador', 'Urus', 'Gallardo', 'Murciélago', 'Countach'],
            'Land Rover' => ['Range Rover', 'Discovery', 'Defender', 'Evoque', 'Velar', 'Sport'],
            'Lexus' => ['IS', 'ES', 'GS', 'LS', 'NX', 'RX'],
            'Mazda' => ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-5', 'MX-5'],
            'Mercedes-Benz' => ['Clase A', 'Clase C', 'Clase E', 'GLA', 'GLC', 'GLE'],
            'Mini' => ['Cooper', 'Countryman', 'Clubman', 'Cabrio', 'Paceman', 'Roadster'],
            'Nissan' => ['Micra', 'Qashqai', 'X-Trail', 'Juke', 'Leaf', '370Z'],
            'Opel' => ['Corsa', 'Astra', 'Insignia', 'Mokka', 'Crossland', 'Grandland'],
            'Peugeot' => ['208', '308', '508', '2008', '3008', '5008'],
            'Porsche' => ['911', 'Cayenne', 'Macan', 'Panamera', 'Boxster', 'Cayman'],
            'Renault' => ['Clio', 'Megane', 'Scenic', 'Captur', 'Kadjar', 'Koleos'],
            'Seat' => ['Ibiza', 'Leon', 'Ateca', 'Arona', 'Tarraco', 'Alhambra'],
            'Skoda' => ['Fabia', 'Octavia', 'Superb', 'Karoq', 'Kodiaq', 'Kamiq'],
            'Tesla' => ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck', 'Roadster'],
            'Toyota' => ['Yaris', 'Corolla', 'Camry', 'RAV4', 'Highlander', 'Prius'],
            'Volkswagen' => ['Polo', 'Golf', 'Passat', 'Tiguan', 'Touareg', 'Arteon'],
            'Volvo' => ['V40', 'V60', 'V90', 'XC40', 'XC60', 'XC90']
        ];

        $modelos = $modelosPorMarca[$marcaNombre] ?? ['Modelo 1', 'Modelo 2', 'Modelo 3', 'Modelo 4', 'Modelo 5'];

        $modelosData = [];
        $now = now();

        foreach ($modelos as $modelo) {
            $modelosData[] = [
                'id_marca' => $marcaId,
                'nombre' => $modelo,
                'created_at' => $now,
                'updated_at' => $now
            ];
        }

        DB::table('modelos')->insert($modelosData);
        $this->command->info("Se han insertado " . count($modelosData) . " modelos de respaldo para {$marcaNombre}");
    }
}
