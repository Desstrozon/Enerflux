<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('orders', function (Blueprint $t) {
      $t->id();
      $t->foreignId('user_id')->constrained()->cascadeOnDelete();
      $t->string('stripe_session_id')->unique();
      $t->string('stripe_payment_intent_id')->nullable()->index();
      $t->enum('status', ['pending','paid','failed','refunded'])->default('pending');
      $t->string('currency', 3)->default('EUR');
      $t->decimal('amount', 12, 2)->default(0);
      $t->json('billing_snapshot')->nullable();
      $t->json('metadata')->nullable();
      $t->timestamps();
    });
  }
  public function down(): void {
    Schema::dropIfExists('orders');
  }
};
