<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('coches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_usuario')->constrained('usuarios');
            $table->foreignId('id_categoria')->constrained('categorias');
            $table->foreignId('id_marca')->constrained('marcas');
            $table->foreignId('id_modelo')->constrained('modelos');
            $table->foreignId('id_provincia')->constrained('provincias');
            $table->integer('anio');
            $table->integer('kilometraje');
            $table->enum('combustible', ['Gasolina', 'Diesel', 'Híbrido', 'Eléctrico']);
            $table->enum('transmision', ['Manual', 'Automático']);
            $table->integer('plazas');
            $table->integer('potencia')->nullable();
            $table->string('color')->nullable();
            $table->decimal('precio', 10, 2);
            $table->text('descripcion')->nullable();
            $table->integer('puertas');
            $table->boolean('verificado')->default(false);
            $table->boolean('vendido')->default(false);
            $table->boolean('destacado')->default(false);
            $table->timestamp('fecha_publicacion')->useCurrent();
            $table->timestamps();
            $table->softDeletes();

            // Índices para optimizar búsquedas
            $table->index('precio');
            $table->index('kilometraje');
            $table->index('anio');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coches');
    }
};
