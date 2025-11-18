<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('product_reviews', function (Blueprint $t) {
            $t->id();
            // tu PK de productos es id_producto, así que usamos foreign manual
            $t->unsignedBigInteger('producto_id');
            $t->foreign('producto_id')->references('id_producto')->on('productos')->onDelete('cascade');

            $t->unsignedBigInteger('user_id');
            $t->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $t->tinyInteger('rating'); // 1..5
            $t->text('comment')->nullable();

            $t->unsignedInteger('likes')->default(0);
            $t->unsignedInteger('dislikes')->default(0);

            $t->timestamps();

            $t->unique(['producto_id','user_id']); // una reseña por usuario
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_reviews');
    }
};
