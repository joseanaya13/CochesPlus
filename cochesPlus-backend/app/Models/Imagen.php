<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Imagen extends Model
{
    protected $table = 'imagenes';
    protected $fillable = [
        'id_coche',
        'ruta',
    ];

    public function coche(): BelongsTo
    {
        return $this->belongsTo(Coche::class, 'id_coche');
    }
}
