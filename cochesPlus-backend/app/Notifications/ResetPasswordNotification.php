<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Lang;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * El token de restablecimiento de contraseña.
     *
     * @var string
     */
    public $token;

    /**
     * Crear una nueva instancia de notificación.
     *
     * @param  string  $token
     * @return void
     */
    public function __construct($token)
    {
        $this->token = $token;
        Log::info('Iniciando proceso de notificación de restablecimiento con token: ' . substr($token, 0, 10) . '...');
    }

    /**
     * Obtener los canales de entrega de la notificación.
     *
     * @param  mixed  $notifiable
     * @return array|string
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Construir la representación de correo de la notificación.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
        $url = $frontendUrl . '/reset-password?token=' . $this->token . '&email=' . urlencode($notifiable->getEmailForPasswordReset());

        // Añadir logs más detallados para diagnóstico
        Log::info('Generando correo de recuperación para: ' . $notifiable->email);
        Log::info('URL de recuperación: ' . $url);
        Log::info('Usando frontend URL: ' . $frontendUrl);
        Log::info('Configuración de correo actual: ' . config('mail.default') . ' / ' . config('mail.mailers.' . config('mail.default') . '.host'));

        return (new MailMessage)
            ->subject(Lang::get('Restablecimiento de Contraseña'))
            ->greeting('¡Hola!')
            ->line(Lang::get('Estás recibiendo este correo porque hemos recibido una solicitud de restablecimiento de contraseña para tu cuenta.'))
            ->action(Lang::get('Restablecer Contraseña'), $url)
            ->line(Lang::get('Este enlace de restablecimiento de contraseña expirará en :count minutos.', ['count' => config('auth.passwords.usuarios.expire', 60)]))
            ->line(Lang::get('Si no solicitaste un restablecimiento de contraseña, no se requiere ninguna acción adicional.'))
            ->salutation('Saludos, ' . config('app.name'));
    }
}
