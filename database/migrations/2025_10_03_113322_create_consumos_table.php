<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('consumos', function (Blueprint $table) {
        $table->bigIncrements('id_consumo');
        $table->string('aparato', 100);
        $table->decimal('potencia', 10, 2);
        $table->decimal('horas_uso', 10, 2);
        $table->decimal('consumo_total', 10, 2);
        $table->date('fecha');
        $table->unsignedBigInteger('id_usuario');
        $table->timestamps();

        $table->foreign('id_usuario')->references('id')->on('users')->cascadeOnDelete();
    });
  }
  public function down(): void {
    Schema::dropIfExists('consumos');
  }
};

