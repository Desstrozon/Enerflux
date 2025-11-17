<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('resultados', function (Blueprint $table) {
        $table->bigIncrements('id_resultado');
        $table->string('mes', 20);
        $table->decimal('produccion', 10, 2);
        $table->decimal('consumo', 10, 2);
        $table->unsignedBigInteger('id_usuario');
        $table->timestamps();

        $table->foreign('id_usuario')->references('id')->on('users')->cascadeOnDelete();
        // balance = produccion - consumo -> lo calculas en SELECT (DB::raw) o en Accessor
    });
  }
  public function down(): void {
    Schema::dropIfExists('resultados');
  }
};

