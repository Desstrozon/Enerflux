<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('estudio_mercado', function (Blueprint $table) {
        $table->bigIncrements('id_estudio');
        $table->string('producto', 100);
        $table->decimal('precio_min', 10, 2);
        $table->decimal('precio_max', 10, 2);
        $table->decimal('precio_promedio', 10, 2);
        $table->integer('anio_estudio');
        $table->string('fuente_datos', 150);
        $table->unsignedBigInteger('id_producto');
        $table->timestamps();

        $table->foreign('id_producto')->references('id_producto')->on('productos')->cascadeOnDelete();
    });
  }
  public function down(): void {
    Schema::dropIfExists('estudio_mercado');
  }
};

