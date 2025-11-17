<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('materiales_utilizados', function (Blueprint $table) {
        $table->bigIncrements('id_material');
        $table->string('nombre', 100);
        $table->decimal('cantidad', 10, 2);
        $table->string('unidad', 20);
        $table->decimal('coste_unitario', 10, 2);
        $table->decimal('coste_total', 10, 2);
        $table->unsignedBigInteger('id_instalacion');
        $table->timestamps();

        $table->foreign('id_instalacion')->references('id_instalacion')->on('instalaciones')->cascadeOnDelete();
    });
  }
  public function down(): void {
    Schema::dropIfExists('materiales_utilizados');
  }
};

