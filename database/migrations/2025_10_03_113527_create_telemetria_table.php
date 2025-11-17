<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('telemetria', function (Blueprint $table) {
        $table->bigIncrements('id_telemetria');
        $table->dateTime('fecha_registro')->nullable();
        $table->decimal('temperatura', 5, 2)->nullable();
        $table->decimal('presion', 6, 2)->nullable();
        $table->decimal('lux', 10, 2)->nullable();
        $table->unsignedBigInteger('id_instalacion')->nullable();
        $table->timestamps();

        $table->foreign('id_instalacion')->references('id_instalacion')->on('instalaciones')->cascadeOnDelete();
    });
  }
  public function down(): void {
    Schema::dropIfExists('telemetria');
  }
};

