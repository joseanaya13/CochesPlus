<?php

namespace App\Http\Controllers;

use App\Models\Marca;
use Illuminate\Http\Request;

class MarcaController extends Controller
{
    /**
     * Devuelve el listado de todas las marcas
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $marcas = Marca::orderBy('nombre')->get();
        return response()->json($marcas);
    }

    /**
     * Devuelve los modelos asociados a una marca
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function getModelos($id)
    {
        $marca = Marca::findOrFail($id);
        $modelos = $marca->modelos()->orderBy('nombre')->get();

        return response()->json($modelos);
    }

    /**
     * Almacena una nueva marca
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255|unique:marcas',
        ]);

        $marca = Marca::create($request->all());

        return response()->json($marca, 201);
    }

    /**
     * Muestra una marca específica
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $marca = Marca::findOrFail($id);
        return response()->json($marca);
    }

    /**
     * Actualiza una marca específica
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|string|max:255|unique:marcas,nombre,' . $id,
        ]);

        $marca = Marca::findOrFail($id);
        $marca->update($request->all());

        return response()->json($marca);
    }

    /**
     * Elimina una marca específica
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $marca = Marca::findOrFail($id);
        $marca->delete();

        return response()->json(null, 204);
    }
}
