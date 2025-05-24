<?php
// cochesPlus-backend/app/Models/Mensaje.php
// Actualizar el modelo existente con los campos correctos

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Mensaje extends Model
{
    protected $table = 'mensajes';

    protected $fillable = [
        'id_conversacion',
        'id_remitente',
        'contenido',  
        'leido',
    ];

    protected $casts = [
        'leido' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function conversacion(): BelongsTo
    {
        return $this->belongsTo(Conversacion::class, 'id_conversacion');
    }

    public function remitente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_remitente');
    }
}
