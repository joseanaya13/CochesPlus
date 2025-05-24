<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Compra extends Model
{
    protected $table = 'compras';
    protected $fillable = [
        'id_coche',
        'id_comprador',
        'id_vendedor',
        'fecha_venta',
        'confirmacion_comprador',
        'confirmacion_vendedor',
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
    public function valoracion(): HasOne
    {
        return $this->hasOne(Valoracion::class, 'id_compra');
    }
}
