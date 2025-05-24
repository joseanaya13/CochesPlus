<?php

namespace App\Models;

use App\Models\Coche;
use App\Models\Compra;
use App\Models\Mensaje;
use App\Models\Favorito;
use App\Models\Conversacion;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable implements MustVerifyEmail
{

    use HasFactory, Notifiable, HasRoles, HasApiTokens, CanResetPassword;

    protected $table = 'usuarios';
    protected $fillable = [
        'nombre',
        'telefono',
        'direccion',
        'email',
        'password',
    ];
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function coches(): HasMany
    {
        return $this->hasMany(Coche::class, 'id_usuario');
    }

    public function comprasRealizadas(): HasMany
    {
        return $this->hasMany(Compra::class, 'id_comprador');
    }

    public function ventasRealizadas(): HasMany
    {
        return $this->hasMany(Compra::class, 'id_vendedor');
    }

    public function favoritos(): HasMany
    {
        return $this->hasMany(Favorito::class, 'id_comprador');
    }

    public function conversacionesComoComprador(): HasMany
    {
        return $this->hasMany(Conversacion::class, 'id_comprador');
    }

    public function conversacionesComoVendedor(): HasMany
    {
        return $this->hasMany(Conversacion::class, 'id_vendedor');
    }
    public function mensajesEnviados(): HasMany
    {
        return $this->hasMany(Mensaje::class, 'id_remitente');
    }

    /**
     * Envía la notificación de restablecimiento de contraseña.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new \App\Notifications\ResetPasswordNotification($token));
    }
}
