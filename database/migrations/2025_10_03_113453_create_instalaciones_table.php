<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('instalaciones', function (Blueprint $table) {
        $table->bigIncrements('id_instalacion');
        $table->string('direccion', 200);
        $table->text('descripcion');
        $table->unsignedBigInteger('id_usuario');
        $table->timestamps();

        $table->foreign('id_usuario')->references('id')->on('users')->cascadeOnDelete();
    });
  }
  public function down(): void {
    Schema::dropIfExists('instalaciones');
  }
};
