<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('productos', function (Blueprint $table) {
        $table->bigIncrements('id_producto');
        $table->string('nombre', 150)->unique();
        $table->text('descripcion')->nullable();
        $table->string('categoria', 20); // panel|bateria|inversor|accesorio
        $table->decimal('precio_base', 10, 2);
        $table->integer('stock')->default(0);
        $table->unsignedBigInteger('id_vendedor')->nullable();
        $table->string('imagen', 255)->nullable()->default('img/producto.png');
        $table->timestamps();

        $table->foreign('id_vendedor')->references('id')->on('users')->nullOnDelete();
    });
  }
  public function down(): void {
    Schema::dropIfExists('productos');
  }
};

