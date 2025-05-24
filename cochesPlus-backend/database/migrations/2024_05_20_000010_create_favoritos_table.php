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
        Schema::create('favoritos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_comprador')->constrained('usuarios');
            $table->foreignId('id_coche')->constrained('coches')->onDelete('cascade');
            $table->timestamps();

            // Evita duplicados: un usuario no puede favoritear el mismo coche 2 veces
            $table->unique(['id_comprador', 'id_coche']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('favoritos');
    }
};
