<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('inversores', function (Blueprint $table) {
        $table->bigIncrements('id_inversor');
        $table->string('modelo', 100)->unique();
        $table->decimal('potencia_nominal', 10, 2);
        $table->decimal('eficiencia', 5, 2);
        $table->string('tipo', 10); // on-grid|off-grid|hibrido
        $table->unsignedBigInteger('id_producto')->unique();
        $table->timestamps();

        $table->foreign('id_producto')->references('id_producto')->on('productos')->cascadeOnDelete();
    });
  }
  public function down(): void {
    Schema::dropIfExists('inversores');
  }
};

