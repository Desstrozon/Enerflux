<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('carts', function (Blueprint $t) {
      $t->id();
      $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();

      // Estados típicos
      $t->enum('status', ['active','ordered','abandoned'])->default('active');

      // Totales
      $t->string('currency', 3)->default('EUR');
      $t->decimal('subtotal', 12, 2)->default(0);
      $t->decimal('total', 12, 2)->default(0);

      $t->timestamps();

      // ❌ No usar unique(['user_id','status']) (ver explicación)
      $t->index(['user_id', 'status']);
    });
  }

  public function down(): void {
    Schema::dropIfExists('carts');
  }
};
