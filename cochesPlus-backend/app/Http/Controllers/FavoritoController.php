<?php

namespace App\Http\Controllers;

use App\Models\Favorito;
use App\Models\Coche;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FavoritoController extends Controller
{
    /**
     * Obtener todos los favoritos del usuario autenticado
     *
     * @return \Illuminate\Http\Response
     */
    public function getUserFavorites()
    {
        $favoritos = Favorito::with(['coche.marca', 'coche.modelo', 'coche.imagenes', 'coche.provincia'])
            ->where('id_comprador', Auth::id())
            ->get();

        return response()->json($favoritos);
    }

    /**
     * Añadir un coche a favoritos
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function addFavorite(Request $request)
    {
        $request->validate([
            'id_coche' => 'required|exists:coches,id'
        ]);

        // Verificar si ya existe el favorito
        $existingFavorite = Favorito::where('id_comprador', Auth::id())
            ->where('id_coche', $request->id_coche)
            ->first();

        if ($existingFavorite) {
            return response()->json([
                'message' => 'El coche ya está en favoritos'
            ], 409); // Conflict
        }

        // Crear el favorito
        $favorito = Favorito::create([
            'id_comprador' => Auth::id(),
            'id_coche' => $request->id_coche
        ]);

        return response()->json($favorito, 201);
    }

    /**
     * Verificar si un coche está en favoritos
     *
     * @param  int  $cocheId
     * @return \Illuminate\Http\Response
     */
    public function checkFavorite($cocheId)
    {
        $favorito = Favorito::where('id_comprador', Auth::id())
            ->where('id_coche', $cocheId)
            ->first();

        return response()->json([
            'isFavorite' => $favorito ? true : false
        ]);
    }

    /**
     * Eliminar un coche de favoritos
     *
     * @param  int  $cocheId
     * @return \Illuminate\Http\Response
     */
    public function removeFavorite($cocheId)
    {
        $favorito = Favorito::where('id_comprador', Auth::id())
            ->where('id_coche', $cocheId)
            ->first();

        if (!$favorito) {
            return response()->json([
                'message' => 'El favorito no existe'
            ], 404);
        }

        $favorito->delete();

        return response()->json(null, 204);
    }
}
