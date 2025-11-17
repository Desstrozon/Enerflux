<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('paneles', function (Blueprint $table) {
        $table->bigIncrements('id_panel');
        $table->string('modelo', 100)->unique();
        $table->decimal('eficiencia', 5, 2);
        $table->decimal('superficie', 6, 2);
        $table->decimal('produccion', 10, 2);
        $table->unsignedBigInteger('id_producto')->unique();
        $table->timestamps();

        $table->foreign('id_producto')->references('id_producto')->on('productos')->cascadeOnDelete();
    });
  }
  public function down(): void {
    Schema::dropIfExists('paneles');
  }
};
