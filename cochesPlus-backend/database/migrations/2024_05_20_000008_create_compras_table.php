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
        Schema::create('compras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_coche')->constrained('coches')->unique(); 
            $table->foreignId('id_comprador')->constrained('usuarios');
            $table->foreignId('id_vendedor')->constrained('usuarios');
            $table->timestamp('fecha_venta')->useCurrent();
            $table->boolean('confirmacion_comprador')->default(false);
            $table->boolean('confirmacion_vendedor')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compras');
    }
};
