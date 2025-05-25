<?php

namespace App\Http\Controllers;

use App\Models\Coche;
use App\Models\Imagen;
use App\Models\Documento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class CocheController extends Controller
{
    public function index(Request $request)
    {
        $query = Coche::with(['usuario', 'marca', 'modelo', 'categoria', 'provincia', 'imagenes', 'documentos']);

        // Filtros directos (coincidencia exacta)
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
            if ($request->has($field)) {
                $query->where($field, $request->$field);
            }
        }

        // Filtros de rango (mínimo y máximo)
        $ranges = [
            'precio' => ['precio_min', 'precio_max'],
            'anio' => ['anio_min', 'anio_max'],
            'kilometraje' => ['km_min', 'km_max'],
            'potencia' => ['potencia_min', 'potencia_max']
        ];

        foreach ($ranges as $field => [$min, $max]) {
            if ($request->has($min)) {
                $query->where($field, '>=', $request->$min);
            }
            if ($request->has($max)) {
                $query->where($field, '<=', $request->$max);
            }
        }

        // Filtros especiales
        if ($request->has('verificado')) {
            $query->where('verificado', $request->verificado === 'true');
        }

        if (!$request->has('incluir_vendidos') || $request->incluir_vendidos !== 'true') {
            $query->where('vendido', 0);
        }

        // Ordenación
        $orderBy = $request->get('order_by', 'fecha_publicacion');
        $orderDir = $request->get('order_dir', 'desc');
        $allowedOrderFields = ['fecha_publicacion', 'precio', 'anio', 'kilometraje', 'potencia'];

        $query->orderBy(in_array($orderBy, $allowedOrderFields) ? $orderBy : 'fecha_publicacion', $orderDir);

        return response()->json($query->paginate($request->get('per_page', 12)));
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
