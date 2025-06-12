<?php

namespace App\Events;

use App\Models\Compra;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PurchaseStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $compra;

    public function __construct(Compra $compra)
    {
        $this->compra = $compra->load(['coche.marca', 'coche.modelo', 'comprador', 'vendedor']);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            // Canal privado para el comprador
            new PrivateChannel('App.Models.User.' . $this->compra->id_comprador),
            // Canal privado para el vendedor
            new PrivateChannel('App.Models.User.' . $this->compra->id_vendedor),
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->compra->id,
            'estado' => $this->compra->estado,
            'estado_texto' => $this->compra->estado_texto,
            'estado_color' => $this->compra->estado_color,
            'precio_acordado' => $this->compra->precio_acordado,
            'coche' => [
                'id' => $this->compra->coche->id,
                'marca' => $this->compra->coche->marca->nombre,
                'modelo' => $this->compra->coche->modelo->nombre,
                'anio' => $this->compra->coche->anio
            ],
            'comprador' => [
                'id' => $this->compra->comprador->id,
                'nombre' => $this->compra->comprador->nombre
            ],
            'vendedor' => [
                'id' => $this->compra->vendedor->id,
                'nombre' => $this->compra->vendedor->nombre
            ],
            'fecha_limite' => $this->compra->fecha_limite_confirmacion?->toISOString(),
            'created_at' => $this->compra->created_at->toISOString(),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'purchase.status.changed';
    }
}
