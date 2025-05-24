<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Coche extends Model
{
    protected $table = 'coches';
    protected $fillable = [
        'id_usuario',
        'id_categoria',
        'id_marca',
        'id_modelo',
        'id_provincia',
        'anio',
        'kilometraje',
        'combustible',
        'transmision',
        'plazas',
        'potencia',
        'color',
        'precio',
        'descripcion',
        'puertas',
        'verificado',
        'vendido',
        'destacado',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_usuario');
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class, 'id_categoria');
    }

    public function marca(): BelongsTo
    {
        return $this->belongsTo(Marca::class, 'id_marca');
    }

    public function modelo(): BelongsTo
    {
        return $this->belongsTo(Modelo::class, 'id_modelo');
    }

    public function provincia(): BelongsTo
    {
        return $this->belongsTo(Provincia::class, 'id_provincia');
    }

    public function imagenes(): HasMany
    {
        return $this->hasMany(Imagen::class, 'id_coche');
    }

    public function documentos(): HasMany
    {
        return $this->hasMany(Documento::class, 'id_coche');
    }

    public function compra(): HasOne
    {
        return $this->hasOne(Compra::class, 'id_coche');
    }

    public function favoritos(): HasMany
    {
        return $this->hasMany(Favorito::class, 'id_coche');
    }

    public function conversaciones(): HasMany
    {
        return $this->hasMany(Conversacion::class, 'id_coche');
    }
}
