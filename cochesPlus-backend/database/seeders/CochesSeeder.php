<?php

namespace Database\Seeders;

use App\Models\Coche;
use App\Models\Imagen;
use App\Models\User;
use App\Models\Marca;
use App\Models\Modelo;
use App\Models\Categoria;
use App\Models\Provincia;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Carbon\Carbon;

class CochesSeeder extends Seeder
{
    /**
     * Ejecuta el seeder para crear coches con imágenes.
     */
    public function run(): void
    {
        // Estructura para almacenar imágenes
        Storage::disk('public')->makeDirectory('coches');

        // Obtenemos los datos necesarios para crear coches
        $usuarios = User::whereHas('roles', function ($query) {
            $query->where('name', 'vendedor');
        })->get();

        if ($usuarios->isEmpty()) {
            $this->command->error('No hay usuarios vendedores. Por favor ejecute UsersSeeder primero.');
            return;
        }

        $marcas = Marca::with('modelos')->get();
        $categorias = Categoria::all();
        $provincias = Provincia::all();

        if ($marcas->isEmpty() || $categorias->isEmpty() || $provincias->isEmpty()) {
            $this->command->error('Faltan datos básicos. Ejecute los seeders previos.');
            return;
        }

        // Lista de URLs de imágenes de coches (asegúrese de tener los derechos para usar estas imágenes)
        $imagenesCoches = [
            "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg",
            "https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg",
            "https://images.pexels.com/photos/1149831/pexels-photo-1149831.jpeg",
            "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
            "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg",
            "https://images.pexels.com/photos/248687/pexels-photo-248687.jpeg",
            "https://images.pexels.com/photos/305070/pexels-photo-305070.jpeg",
            "https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg",
            "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg",
            "https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg",
            "https://images.pexels.com/photos/337909/pexels-photo-337909.jpeg",
            "https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg",
            "https://images.pexels.com/photos/97079/pexels-photo-97079.jpeg",
            "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg",
            "https://images.pexels.com/photos/193991/pexels-photo-193991.jpeg",
            "https://images.pexels.com/photos/100653/pexels-photo-100653.jpeg",
            "https://images.pexels.com/photos/114905/pexels-photo-114905.jpeg",
            "https://images.pexels.com/photos/305070/pexels-photo-305070.jpeg",
            "https://images.pexels.com/photos/248687/pexels-photo-248687.jpeg",
            "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg",
            "https://images.pexels.com/photos/305070/pexels-photo-305070.jpeg",
            "https://images.pexels.com/photos/305070/pexels-photo-305070.jpeg",
            "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg",
            "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg",
            "https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg",
            "https://images.pexels.com/photos/193991/pexels-photo-193991.jpeg",
            "https://images.pexels.com/photos/100653/pexels-photo-100653.jpeg",
            "https://images.pexels.com/photos/114905/pexels-photo-114905.jpeg",
            "https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg",
            "https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg",
            "https://images.pexels.com/photos/337909/pexels-photo-337909.jpeg",
            "https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg",
            "https://images.pexels.com/photos/97079/pexels-photo-97079.jpeg",
            "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg",
            "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg",
            "https://images.pexels.com/photos/248687/pexels-photo-248687.jpeg",
            "https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg",
            "https://images.pexels.com/photos/305070/pexels-photo-305070.jpeg",
            "https://images.pexels.com/photos/100653/pexels-photo-100653.jpeg",
            "https://images.pexels.com/photos/114905/pexels-photo-114905.jpeg"
        ];

        // Datos para coches
        $combustibles = ['Gasolina', 'Diesel', 'Híbrido', 'Eléctrico'];
        $transmisiones = ['Manual', 'Automático'];
        $colores = ['Negro', 'Blanco', 'Gris', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Marrón', 'Plata'];

        // Crear coches
        $this->command->info('Creando coches con imágenes...');

        for ($i = 0; $i < 30; $i++) {
            // Seleccionar un usuario, marca/modelo, categoría y provincia aleatorios
            $usuario = $usuarios->random();
            $marca = $marcas->random();
            $modelo = $marca->modelos->random();
            $categoria = $categorias->random();
            $provincia = $provincias->random();

            // Año aleatorio entre 2000 y año actual
            $anio = rand(2000, date('Y'));

            // Calcular kilometraje en función de la antigüedad (más antiguo = más km)
            $antiguedad = date('Y') - $anio;
            $kilometraje = rand(5000, 20000) * ($antiguedad + 1);

            // Seleccionar datos aleatorios
            $combustible = $combustibles[array_rand($combustibles)];
            $transmision = $transmisiones[array_rand($transmisiones)];
            $color = $colores[array_rand($colores)];
            $plazas = rand(2, 9);
            $puertas = rand(2, 5);
            $potencia = rand(60, 400);
            $precio = rand(1000, 80000);

            // Determinar si el coche está verificado o destacado (10% de probabilidad)
            $verificado = (rand(1, 10) === 1);
            $destacado = (rand(1, 10) === 1);
            $vendido = (rand(1, 10) === 1);

            // Crear descripción detallada
            $descripcion = "Vendo " . $marca->nombre . " " . $modelo->nombre . " en excelente estado. ";
            $descripcion .= "Tiene " . $kilometraje . " km, motor de " . $potencia . " CV, " . $combustible . ", ";
            $descripcion .= "y transmisión " . $transmision . ". Color " . $color . ". ";
            $descripcion .= "Cuenta con " . $plazas . " plazas y " . $puertas . " puertas. ";

            // Agregar extras aleatorios
            $extras = [
                "Climatizador",
                "Bluetooth",
                "Navegador GPS",
                "Sensores de aparcamiento",
                "Cámara trasera",
                "Techo solar",
                "Asientos eléctricos",
                "Asientos calefactables",
                "Llantas de aleación",
                "Control de crucero adaptativo",
                "Asistente de carril"
            ];

            // Seleccionar entre 3 y 6 extras aleatorios
            $extrasSeleccionados = array_rand(array_flip($extras), rand(3, 6));
            $descripcion .= "Extras: " . implode(", ", (array)$extrasSeleccionados) . ". ";
            $descripcion .= "No dude en contactar para más información o concertar una prueba.";

            // Crear el coche
            $coche = Coche::create([
                'id_usuario' => $usuario->id,
                'id_marca' => $marca->id,
                'id_modelo' => $modelo->id,
                'id_categoria' => $categoria->id,
                'id_provincia' => $provincia->id,
                'anio' => $anio,
                'kilometraje' => $kilometraje,
                'combustible' => $combustible,
                'transmision' => $transmision,
                'plazas' => $plazas,
                'potencia' => $potencia,
                'color' => $color,
                'precio' => $precio,
                'descripcion' => $descripcion,
                'puertas' => $puertas,
                'verificado' => $verificado,
                'destacado' => $destacado,
                'vendido' => $vendido,
                'fecha_publicacion' => Carbon::now()->subDays(rand(1, 60)),
            ]);

            // Descargar y guardar imágenes (entre 1 y 4 imágenes por coche)
            $numImagenes = rand(1, 4);
            for ($j = 0; $j < $numImagenes; $j++) {
                // Seleccionar una imagen aleatoria de la lista
                $imagenUrl = $imagenesCoches[array_rand($imagenesCoches)];

                // Nombre de archivo único
                $nombreArchivo = 'coche_' . $coche->id . '_' . Str::random(8) . '.jpg';
                $rutaArchivo = 'coches/' . $coche->id;

                // Crear directorio si no existe
                if (!Storage::disk('public')->exists($rutaArchivo)) {
                    Storage::disk('public')->makeDirectory($rutaArchivo);
                }

                $rutaCompleta = $rutaArchivo . '/' . $nombreArchivo;

                try {
                    // Descargar la imagen y guardarla en storage/app/public/coches/{id_coche}
                    $context = stream_context_create([
                        'ssl' => [
                            'verify_peer' => false,
                            'verify_peer_name' => false,
                        ],
                    ]);
                    $contenido = file_get_contents($imagenUrl, false, $context);
                    Storage::disk('public')->put($rutaCompleta, $contenido);

                    // Crear registro en la base de datos
                    Imagen::create([
                        'id_coche' => $coche->id,
                        'ruta' => "storage/{$rutaCompleta}"
                    ]);

                    $this->command->info("Imagen guardada: {$nombreArchivo} para coche ID: {$coche->id}");
                } catch (\Exception $e) {
                    $this->command->error("Error al guardar imagen: " . $e->getMessage());
                }
            }
        }

        $this->command->info('¡Coches creados con éxito!');
    }
}
