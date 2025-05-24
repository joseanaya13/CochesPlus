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
                $response = Http::get($this->apiUrl . urlencode($marca->nombre) . '?format=json');

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

        $modelosPorMarca = [];

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
