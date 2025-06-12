<?php

namespace App\Http\Controllers;

use App\Models\Coche;
use App\Models\Imagen;
use App\Models\Documento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CocheController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Log para debug
            Log::info('CocheController: Parámetros recibidos', $request->all());

            $query = Coche::with(['usuario', 'marca', 'modelo', 'categoria', 'provincia', 'imagenes', 'documentos']);

            // Filtros directos (coincidencia exacta) - CORREGIDO
            $filters = [
                'id_marca',
                'id_modelo',
                'id_categoria',
                'id_provincia',
                'combustible',
                'transmision',
                'plazas',
                'puertas'
            ];

            foreach ($filters as $field) {
                if ($request->filled($field)) { // Cambio: usar filled() en lugar de has()
                    $value = $request->get($field);
                    // Validar que el valor no esté vacío
                    if (!empty($value) && $value !== '0' && $value !== 0) {
                        $query->where($field, $value);
                        Log::info("Aplicando filtro directo: {$field} = {$value}");
                    }
                }
            }

            // Filtros de rango (mínimo y máximo) - MEJORADO
            $ranges = [
                'precio' => ['precio_min', 'precio_max'],
                'anio' => ['anio_min', 'anio_max'],
                'kilometraje' => ['km_min', 'km_max'],
                'potencia' => ['potencia_min', 'potencia_max']
            ];

            foreach ($ranges as $field => [$min, $max]) {
                if ($request->filled($min)) {
                    $minValue = $request->get($min);
                    if (is_numeric($minValue) && $minValue > 0) {
                        $query->where($field, '>=', $minValue);
                        Log::info("Aplicando filtro mínimo: {$field} >= {$minValue}");
                    }
                }
                if ($request->filled($max)) {
                    $maxValue = $request->get($max);
                    if (is_numeric($maxValue) && $maxValue > 0) {
                        $query->where($field, '<=', $maxValue);
                        Log::info("Aplicando filtro máximo: {$field} <= {$maxValue}");
                    }
                }
            }

            // Filtro de verificado - CORREGIDO
            if ($request->filled('verificado')) {
                $verificado = $request->get('verificado');
                if ($verificado === 'true' || $verificado === '1' || $verificado === 1) {
                    $query->where('verificado', true);
                    Log::info("Aplicando filtro: solo verificados");
                } elseif ($verificado === 'false' || $verificado === '0' || $verificado === 0) {
                    $query->where('verificado', false);
                    Log::info("Aplicando filtro: solo no verificados");
                }
            }

            // Filtro de coches vendidos - CORREGIDO
            if (!$request->filled('incluir_vendidos') || $request->get('incluir_vendidos') !== 'true') {
                $query->where('vendido', false); // Cambio: usar false en lugar de 0
                Log::info("Aplicando filtro: excluir vendidos");
            } else {
                Log::info("Incluyendo coches vendidos");
            }

            // Ordenación - MEJORADO
            $orderBy = $request->get('order_by', 'created_at'); // Cambio: usar created_at por defecto
            $orderDir = $request->get('order_dir', 'desc');

            // Mapear campos de ordenación
            $orderFieldMap = [
                'fecha_publicacion' => 'created_at',
                'precio' => 'precio',
                'anio' => 'anio',
                'kilometraje' => 'kilometraje',
                'potencia' => 'potencia'
            ];

            $actualOrderField = $orderFieldMap[$orderBy] ?? 'created_at';
            $allowedOrderDir = in_array(strtolower($orderDir), ['asc', 'desc']) ? $orderDir : 'desc';

            $query->orderBy($actualOrderField, $allowedOrderDir);
            Log::info("Aplicando ordenación: {$actualOrderField} {$allowedOrderDir}");

            // Paginación
            $perPage = $request->get('per_page', 12);
            $perPage = min(max((int)$perPage, 1), 50); // Entre 1 y 50

            // Obtener resultados
            $result = $query->paginate($perPage);

            Log::info('CocheController: Consulta SQL ejecutada', [
                'sql' => $query->toSql(),
                'bindings' => $query->getBindings(),
                'total_results' => $result->total()
            ]);

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('CocheController: Error en index', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return response()->json([
                'error' => 'Error al obtener los coches',
                'message' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    public function getUserCars(Request $request)
    {
        $query = Coche::with(['marca', 'modelo', 'categoria', 'provincia', 'imagenes'])
            ->where('id_usuario', Auth::id());

        if (!$request->has('incluir_vendidos') || $request->incluir_vendidos !== 'true') {
            $query->where('vendido', 0);
        }

        return response()->json($query->orderBy('fecha_publicacion', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_marca' => 'required|exists:marcas,id',
            'id_modelo' => 'required|exists:modelos,id',
            'anio' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'kilometraje' => 'required|integer|min:0',
            'combustible' => 'required|in:Gasolina,Diesel,Híbrido,Eléctrico',
            'transmision' => 'required|in:Manual,Automático',
            'plazas' => 'required|integer|min:1|max:9',
            'puertas' => 'required|integer|min:1|max:5',
            'precio' => 'required|numeric|min:0',
            'descripcion' => 'nullable|string',
            'id_categoria' => 'required|exists:categorias,id',
            'id_provincia' => 'required|exists:provincias,id',
            'potencia' => 'nullable|integer',
            'color' => 'nullable|string|max:255',
            'imagenes.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'documentos.*' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ]);

        try {
            DB::beginTransaction();

            $coche = Coche::create([
                'id_usuario'      => Auth::id(),
                'id_marca'        => $request->id_marca,
                'id_modelo'       => $request->id_modelo,
                'id_categoria'    => $request->id_categoria,
                'id_provincia'    => $request->id_provincia,
                'titulo'          => $request->titulo,
                'descripcion'     => $request->descripcion,
                'precio'          => $request->precio,
                'anio'            => $request->anio,
                'kilometraje'     => $request->kilometraje,
                'combustible'     => $request->combustible,
                'transmision'     => $request->transmision,
                'color'           => $request->color,
                'puertas'         => $request->puertas,
                'plazas'          => $request->plazas,
                'potencia'        => $request->potencia,
                'verificado'      => false,
                'destacado'       => false,
                'vendido'         => false,
                'fecha_publicacion' => now(),
            ]);

            if ($request->hasFile('imagenes')) {
                $this->guardarImagenes($request->file('imagenes'), $coche->id);
            }

            if ($request->hasFile('documentos')) {
                $this->guardarDocumentos($request->file('documentos'), $coche->id);
            }

            DB::commit();
            $coche->load(['marca', 'modelo', 'categoria', 'provincia', 'imagenes', 'documentos']);

            return response()->json($coche, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al crear el anuncio: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        return response()->json(
            Coche::with(['usuario', 'marca', 'modelo', 'categoria', 'provincia', 'imagenes', 'documentos'])
                ->findOrFail($id)
        );
    }

    public function update(Request $request, $id)
    {
        $coche = Coche::findOrFail($id);

        // if (!$this->puedeEditar($coche)) {
        //     return response()->json(['error' => 'No autorizado'], 403);
        // }

        $request->validate([
            'id_marca' => 'sometimes|required|exists:marcas,id',
            'id_modelo' => 'sometimes|required|exists:modelos,id',
            'anio' => 'sometimes|required|integer|min:1900|max:' . (date('Y') + 1),
            'kilometraje' => 'sometimes|required|integer|min:0',
            'combustible' => 'sometimes|required|in:Gasolina,Diesel,Híbrido,Eléctrico',
            'transmision' => 'sometimes|required|in:Manual,Automático',
            'plazas' => 'sometimes|required|integer|min:1|max:9',
            'puertas' => 'sometimes|required|integer|min:1|max:5',
            'precio' => 'sometimes|required|numeric|min:0',
            'descripcion' => 'sometimes|nullable|string',
            'id_categoria' => 'sometimes|required|exists:categorias,id',
            'id_provincia' => 'sometimes|required|exists:provincias,id',
            'potencia' => 'sometimes|nullable|integer',
            'color' => 'sometimes|nullable|string|max:255',
            'verificado' => 'sometimes|boolean',
            'vendido' => 'sometimes|boolean',
            'destacado' => 'sometimes|boolean',
        ]);

        try {
            DB::beginTransaction();

            $coche->fill($request->only([
                'id_marca',
                'id_modelo',
                'id_categoria',
                'id_provincia',
                'combustible',
                'transmision',
                'precio',
                'anio',
                'kilometraje',
                'descripcion',
                'color',
                'fecha_publicacion',
                'vendido'
            ]));

            // if (Auth::user()->hasRole('admin')) {
            //     $coche->verificado = $request->boolean('verificado', $coche->verificado);
            //     $coche->destacado = $request->boolean('destacado', $coche->destacado);
            // }

            $coche->vendido = $request->boolean('vendido', $coche->vendido);

            $coche->save();

            DB::commit();
            $coche->load(['marca', 'modelo', 'categoria', 'provincia', 'imagenes', 'documentos']);

            return response()->json($coche);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al actualizar el anuncio: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $coche = Coche::findOrFail($id);

        // if (!$this->puedeEditar($coche)) {
        //     return response()->json(['error' => 'No autorizado'], 403);
        // }

        try {
            DB::beginTransaction();

            // Eliminar imágenes
            foreach ($coche->imagenes as $imagen) {
                $this->eliminarArchivo([$imagen]);
            }

            // Eliminar documentos
            foreach ($coche->documentos as $documento) {
                $this->eliminarArchivo([$documento]);
            }

            // Eliminar relaciones
            $coche->conversaciones()->each(function ($conversacion) {
                $conversacion->mensajes()->delete();
                $conversacion->delete();
            });
            $coche->favoritos()->delete();
            $coche->delete();

            DB::commit();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al eliminar el anuncio: ' . $e->getMessage()], 500);
        }
    }

    public function addImage(Request $request, $id)
    {
        $coche = Coche::findOrFail($id);

        // if (!$this->puedeEditar($coche)) {
        //     return response()->json(['error' => 'No autorizado'], 403);
        // }

        $request->validate([
            'imagenes.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'imagen' => 'required_without:imagenes|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        try {
            DB::beginTransaction();

            if ($request->hasFile('imagenes')) {
                $this->guardarImagenes($request->file('imagenes'), $id);
            } elseif ($request->hasFile('imagen')) {
                $imagen = $request->file('imagen');
                $path = $imagen->store("coches/{$id}", 'public');

                Imagen::create([
                    'id_coche' => $id,
                    'ruta' => "storage/{$path}",
                ]);
            } else {
                return response()->json(['error' => 'No se ha enviado ninguna imagen'], 400);
            }

            DB::commit();

            $coche->load('imagenes');
            return response()->json($coche);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al guardar la imagen: ' . $e->getMessage()], 500);
        }
    }

    public function removeImage($id, $imagenId)
    {
        $coche = Coche::findOrFail($id);

        // if (!$this->puedeEditar($coche)) {
        //     return response()->json(['error' => 'No autorizado'], 403);
        // }

        try {
            DB::beginTransaction();
            $imagen = Imagen::where('id_coche', $id)->where('id', $imagenId)->firstOrFail();
            $this->eliminarArchivo([$imagen]);
            DB::commit();

            return response()->json(null, 204);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al eliminar la imagen: ' . $e->getMessage()], 500);
        }
    }

    public function addDocument(Request $request, $id)
    {
        $coche = Coche::findOrFail($id);

        // if (!$this->puedeEditar($coche)) {
        //     return response()->json(['error' => 'No autorizado'], 403);
        // }

        $request->validate([
            'documentos.*' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
            'documento' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ]);

        try {
            DB::beginTransaction();

            if ($request->hasFile('documentos')) {
                $this->guardarDocumentos($request->file('documentos'), $id);
            } elseif ($request->hasFile('documento')) {
                $documento = $request->file('documento');
                $path = $documento->store("documentos/{$id}", 'public');

                Documento::create([
                    'id_coche' => $id,
                    'tipo' => $documento->getClientOriginalExtension(),
                    'ruta' => "storage/{$path}",
                    'descripcion' => $request->input('descripcion', 'Documento ' . $documento->getClientOriginalName()),
                ]);
            } else {
                return response()->json(['error' => 'No se ha enviado ningún documento'], 400);
            }

            DB::commit();

            $coche->load('documentos');
            return response()->json($coche);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al guardar el documento: ' . $e->getMessage()], 500);
        }
    }

    public function removeDocument($id, $documentoId)
    {
        $coche = Coche::findOrFail($id);

        // if (!$this->puedeEditar($coche)) {
        //     return response()->json(['error' => 'No autorizado'], 403);
        // }

        try {
            DB::beginTransaction();
            $documento = Documento::where('id_coche', $id)->where('id', $documentoId)->firstOrFail();
            $this->eliminarArchivo([$documento]);
            DB::commit();

            return response()->json(null, 204);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al eliminar el documento: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Guarda las imágenes asociadas a un coche
     */
    private function guardarImagenes($imagenes, $cocheId)
    {
        if (!$imagenes) {
            return;
        }

        foreach ($imagenes as $imagen) {
            $path = $imagen->store("coches/{$cocheId}", 'public');

            Imagen::create([
                'id_coche' => $cocheId,
                'ruta' => "storage/{$path}",
            ]);
        }
    }

    /**
     * Guarda los documentos asociados a un coche
     */
    private function guardarDocumentos($documentos, $cocheId)
    {
        if (!$documentos) {
            return;
        }

        foreach ($documentos as $documento) {
            $path = $documento->store("documentos/{$cocheId}", 'public');

            Documento::create([
                'id_coche' => $cocheId,
                'tipo' => $documento->getClientOriginalExtension(),
                'ruta' => "storage/{$path}",
                'descripcion' => 'Documento ' . $documento->getClientOriginalName(),
            ]);
        }
    }

    /**
     * Elimina archivos del almacenamiento y la base de datos
     */
    private function eliminarArchivo($archivos)
    {
        if (!$archivos) {
            return;
        }

        // Asegurarse de que $archivos sea un array
        $archivos = is_array($archivos) ? $archivos : [$archivos];

        foreach ($archivos as $archivo) {
            $path = str_replace('storage/', 'public/', $archivo->ruta);
            Storage::delete($path);
            $archivo->delete();
        }
    }

    /**
     * Verifica un coche después de revisar sus documentos (solo administradores)
     *
     * @OA\Put(
     *     path="/api/coches/{id}/verificar",
     *     summary="Verificar un coche",
     *     description="Cambia el estado de verificación de un coche (solo para administradores)",
     *     operationId="verificarCoche",
     *     tags={"Coches"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID del coche a verificar",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"verificado"},
     *             @OA\Property(property="verificado", type="boolean", example=true, description="Estado de verificación")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Coche verificado correctamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Coche verificado correctamente"),
     *             @OA\Property(property="coche", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Coche no encontrado"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="No autorizado"
     *     )
     * )
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function verificarCoche(Request $request, $id)
    {
        // Validar
        $request->validate([
            'verificado' => 'required|boolean'
        ], [
            'verificado.required' => 'El estado de verificación es obligatorio',
            'verificado.boolean' => 'El estado de verificación debe ser booleano'
        ]);

        try {
            // Buscar el coche
            $coche = Coche::findOrFail($id);

            // Verificar que el usuario es administrador (ya validado en middleware pero por seguridad extra)
            // if (!Auth::user() || !Auth::user()->hasRole('admin')) {
            //     return response()->json([
            //         'message' => 'No tienes permisos para verificar coches'
            //     ], 403);
            // }

            DB::beginTransaction();

            // Actualizar el estado de verificación
            $coche->verificado = $request->verificado;
            $coche->save();

            DB::commit();

            // Devolver el coche actualizado
            return response()->json([
                'message' => $request->verificado
                    ? 'Coche verificado correctamente'
                    : 'Se ha removido la verificación del coche',
                'coche' => $coche->load(['marca', 'modelo', 'categoria', 'provincia', 'imagenes', 'documentos'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al verificar el coche',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
