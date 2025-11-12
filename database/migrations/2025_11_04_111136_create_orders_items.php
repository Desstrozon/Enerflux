<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('order_items', function (Blueprint $t) {
      $t->id();
      $t->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
      $t->unsignedBigInteger('producto_id');         // referencia lógica
      $t->string('name');
      $t->string('image')->nullable();
      $t->decimal('unit_price', 12, 2);
      $t->unsignedInteger('quantity');
      $t->decimal('line_total', 12, 2);
      $t->timestamps();

      $t->index(['order_id']);
      $t->index(['producto_id']);
    });
  }
  public function down(): void {
    Schema::dropIfExists('order_items');
  }
};