<?php

namespace App\Http\Controllers;

use App\Models\Provincia;
use Illuminate\Http\Request;

class ProvinciaController extends Controller
{
    /**
     * Devuelve el listado de todas las provincias
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $provincias = Provincia::orderBy('nombre')->get();
        return response()->json($provincias);
    }

    /**
     * Almacena una nueva provincia
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255|unique:provincias',
        ]);

        $provincia = Provincia::create($request->all());

        return response()->json($provincia, 201);
    }

    /**
     * Muestra una provincia específica
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $provincia = Provincia::findOrFail($id);
        return response()->json($provincia);
    }

    /**
     * Actualiza una provincia específica
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|string|max:255|unique:provincias,nombre,' . $id,
        ]);

        $provincia = Provincia::findOrFail($id);
        $provincia->update($request->all());

        return response()->json($provincia);
    }

    /**
     * Elimina una provincia específica
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $provincia = Provincia::findOrFail($id);
        $provincia->delete();

        return response()->json(null, 204);
    }
}
