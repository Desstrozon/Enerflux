<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {

    Schema::create('perfil_cliente', function (Blueprint $table) {
      $table->unsignedBigInteger('id_usuario')->primary();
      $table->string('telefono', 30);
      $table->string('direccion', 190);
      $table->timestamps();

      $table->foreign('id_usuario')->references('id')->on('users')->cascadeOnDelete();
    });
  }
  public function down(): void
  {
    Schema::dropIfExists('perfil_cliente');
  }
};
