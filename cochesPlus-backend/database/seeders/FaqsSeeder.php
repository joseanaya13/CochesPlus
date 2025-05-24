<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FaqsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('faqs')->insert([
            [
                'pregunta' => '¿Cómo puedo vender mi coche?',
                'respuesta' => 'Para vender tu coche, debes registrarte como vendedor y publicar un anuncio con toda la información y fotos de tu vehículo.',
                'orden' => 1,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'pregunta' => '¿Cómo contacto con un vendedor?',
                'respuesta' => 'Puedes contactar con un vendedor a través del sistema de mensajes internos disponible en cada anuncio de coche.',
                'orden' => 2,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'pregunta' => '¿Cómo puedo verificar un coche?',
                'respuesta' => 'Los coches son verificados por nuestro equipo tras revisar la documentación que sube el vendedor. Un coche verificado tendrá una insignia especial en su anuncio.',
                'orden' => 3,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'pregunta' => '¿Puedo marcar un coche como favorito?',
                'respuesta' => 'Sí, para guardar un coche como favorito solo tienes que hacer clic en el icono del corazón que aparece en cada anuncio. Podrás acceder a tus favoritos desde tu perfil.',
                'orden' => 4,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'pregunta' => '¿Cómo puedo valorar a un vendedor?',
                'respuesta' => 'Una vez realizada la compra, podrás valorar al vendedor desde la sección "Mis compras" en tu perfil. Solo se permite una valoración por transacción.',
                'orden' => 5,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
