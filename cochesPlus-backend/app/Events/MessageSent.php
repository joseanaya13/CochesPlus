<?php
// cochesPlus-backend/app/Events/MessageSent.php
// Crear con: php artisan make:event MessageSent

namespace App\Events;

use App\Models\Mensaje;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $mensaje;

    /**
     * Create a new event instance.
     */
    public function __construct(Mensaje $mensaje)
    {
        $this->mensaje = $mensaje;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversacion.' . $this->mensaje->id_conversacion),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->mensaje->id,
            'id_conversacion' => $this->mensaje->id_conversacion,
            'id_remitente' => $this->mensaje->id_remitente,
            'contenido' => $this->mensaje->contenido,
            'leido' => $this->mensaje->leido,
            'created_at' => $this->mensaje->created_at,
            'remitente' => [
                'id' => $this->mensaje->remitente->id,
                'nombre' => $this->mensaje->remitente->nombre,
            ]
        ];
    }

    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'message.sent';
    }
}
