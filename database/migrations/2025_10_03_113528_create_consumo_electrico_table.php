<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    // ESTA TABLA a futuro la telemetría cruda quizá irá a InfluxDB; esta tabla te vale para resúmenes o snapshots.
  public function up(): void {
    Schema::create('consumo_electrico', function (Blueprint $table) {
        $table->bigIncrements('id_consumoElectrico');
        $table->decimal('voltaje', 10, 2)->nullable();
        $table->decimal('intensidad', 10, 2)->nullable();
        $table->decimal('potencia', 10, 2)->nullable();
        $table->decimal('energia', 10, 2)->nullable();
        $table->decimal('factor_potencia', 5, 2)->nullable();
        $table->decimal('factor_voltaje', 5, 2)->nullable();
        $table->decimal('temperatura', 5, 2)->nullable();
        $table->unsignedBigInteger('id_telemetria')->unique();
        $table->timestamps();

        $table->foreign('id_telemetria')->references('id_telemetria')->on('telemetria')->cascadeOnDelete();
    });
  }
  public function down(): void {
    Schema::dropIfExists('consumo_electrico');
  }
};

