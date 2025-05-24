<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Favorito extends Model
{
    protected $table = 'favoritos';
    protected $fillable = [
        'id_comprador',
        'id_coche',
    ];

    public function comprador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_comprador');
    }

    public function coche(): BelongsTo
    {
        return $this->belongsTo(Coche::class, 'id_coche');
    }
}
