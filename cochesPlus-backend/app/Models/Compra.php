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
        'precio_acordado',
        'condiciones',
        'estado',
        'fecha_venta',
        'fecha_limite_confirmacion',
        'motivo_cancelacion',
        'confirmacion_comprador',
        'confirmacion_vendedor',
    ];

    protected $casts = [
        'fecha_venta' => 'datetime',
        'fecha_limite_confirmacion' => 'datetime',
        'confirmacion_comprador' => 'boolean',
        'confirmacion_vendedor' => 'boolean',
        'precio_acordado' => 'decimal:2'
    ];

    // Estados posibles
    const ESTADO_PENDIENTE_VENDEDOR = 'PENDIENTE_VENDEDOR';
    const ESTADO_PENDIENTE_COMPRADOR = 'PENDIENTE_COMPRADOR';
    const ESTADO_CONFIRMADA = 'CONFIRMADA';
    const ESTADO_CANCELADA = 'CANCELADA';

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

    // Métodos de utilidad
    public function estaCompletada(): bool
    {
        return $this->estado === self::ESTADO_CONFIRMADA;
    }

    public function estaCancelada(): bool
    {
        return $this->estado === self::ESTADO_CANCELADA;
    }

    public function estaPendiente(): bool
    {
        return in_array($this->estado, [
            self::ESTADO_PENDIENTE_VENDEDOR,
            self::ESTADO_PENDIENTE_COMPRADOR
        ]);
    }

    public function puedeSerValorada(): bool
    {
        return $this->estaCompletada() &&
            $this->confirmacion_comprador &&
            $this->confirmacion_vendedor;
    }

    public function haExpirado(): bool
    {
        return $this->fecha_limite_confirmacion &&
            $this->fecha_limite_confirmacion < now() &&
            $this->estaPendiente();
    }

    public function getEstadoTextoAttribute(): string
    {
        switch ($this->estado) {
            case self::ESTADO_PENDIENTE_VENDEDOR:
                return 'Esperando respuesta del vendedor';
            case self::ESTADO_PENDIENTE_COMPRADOR:
                return 'Esperando confirmación del comprador';
            case self::ESTADO_CONFIRMADA:
                return 'Compra confirmada';
            case self::ESTADO_CANCELADA:
                return 'Compra cancelada';
            default:
                return 'Estado desconocido';
        }
    }

    public function getEstadoColorAttribute(): string
    {
        switch ($this->estado) {
            case self::ESTADO_PENDIENTE_VENDEDOR:
            case self::ESTADO_PENDIENTE_COMPRADOR:
                return 'warning';
            case self::ESTADO_CONFIRMADA:
                return 'success';
            case self::ESTADO_CANCELADA:
                return 'error';
            default:
                return 'secondary';
        }
    }
}
