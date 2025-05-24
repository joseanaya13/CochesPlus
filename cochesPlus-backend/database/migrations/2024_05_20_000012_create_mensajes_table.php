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
        Schema::create('mensajes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_conversacion')->constrained('conversaciones')->onDelete('cascade');
            $table->foreignId('id_remitente')->constrained('usuarios');
            $table->text('contenido');
            $table->boolean('leido')->default(false);
            $table->timestamps();
            $table->index('id_conversacion'); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mensajes');
    }
};
