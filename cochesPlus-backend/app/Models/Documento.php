<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Documento extends Model
{

    protected $table = 'documentos';
    protected $fillable = [
        'id_coche',
        'tipo',
        'ruta',
        'descripcion',
    ];
    public function coche(): BelongsTo
    {
        return $this->belongsTo(Coche::class, 'id_coche');
    }
}
