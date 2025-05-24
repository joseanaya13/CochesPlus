<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversacion extends Model
{
    protected $table = 'conversaciones';

    protected $fillable = [
        'id_coche',
        'id_comprador',
        'id_vendedor',
    ];

    public function coche(): BelongsTo
    {
        return $this->belongsTo(Coche::class, 'id_coche');
    }
    public function comprador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_comprador');
    }
    public function vendedor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_vendedor');
    }
    public function mensajes(): HasMany
    {
        return $this->hasMany(Mensaje::class, 'id_conversacion');
    }
}
