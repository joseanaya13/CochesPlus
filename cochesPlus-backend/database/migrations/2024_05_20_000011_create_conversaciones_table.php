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
        Schema::create('conversaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_coche')->constrained('coches');
            $table->foreignId('id_comprador')->constrained('usuarios');
            $table->foreignId('id_vendedor')->constrained('usuarios');
            $table->timestamps();

            // Conversación única por coche y usuarios
            $table->unique(['id_coche', 'id_comprador', 'id_vendedor']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversaciones');
    }
};
