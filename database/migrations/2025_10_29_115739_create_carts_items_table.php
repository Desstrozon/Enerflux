<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('cart_items', function (Blueprint $t) {
      $t->id();

      $t->foreignId('cart_id')
        ->constrained('carts')
        ->cascadeOnDelete();

      // FK directa al PK no estándar de productos (id_producto)
      $t->unsignedBigInteger('producto_id');
      $t->foreign('producto_id')
        ->references('id_producto')->on('productos')
        ->restrictOnDelete();

      $t->unsignedInteger('quantity')->default(1);

      // snapshots (evitan incoherencias si cambia el producto)
      $t->decimal('unit_price', 12, 2);
      $t->string('name_snapshot', 150)->nullable();
      $t->string('image_snapshot', 255)->nullable();

      $t->timestamps();

      $t->unique(['cart_id','producto_id']);
      $t->index(['cart_id']);
      $t->index(['producto_id']);
    });
  }

  public function down(): void {
    Schema::dropIfExists('cart_items');
  }
};
