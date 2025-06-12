<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateComprasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('compras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_coche')->constrained('coches')->unique();
            $table->foreignId('id_comprador')->constrained('usuarios');
            $table->foreignId('id_vendedor')->constrained('usuarios');
            $table->decimal('precio_acordado', 10, 2)->nullable();
            $table->text('condiciones')->nullable();
            $table->string('estado', 30)->default('PENDIENTE_VENDEDOR');
            $table->timestamp('fecha_venta')->nullable();
            $table->timestamp('fecha_limite_confirmacion')->nullable();
            $table->string('motivo_cancelacion', 255)->nullable();
            $table->boolean('confirmacion_comprador')->default(false);
            $table->boolean('confirmacion_vendedor')->default(false);
            $table->timestamps();
        });
        
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('compras');
    }
}
