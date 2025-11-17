<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('comparativa_precios', function (Blueprint $table) {
        $table->bigIncrements('id_comparativa');
        $table->string('proveedor', 100);
        $table->decimal('precio_ofrecido', 10, 2);
        $table->date('fecha_actualizacion');
        $table->unsignedBigInteger('id_producto');
        $table->timestamps();

        $table->foreign('id_producto')->references('id_producto')->on('productos')->cascadeOnDelete();
    });
  }
  public function down(): void {
    Schema::dropIfExists('comparativa_precios');
  }
};
