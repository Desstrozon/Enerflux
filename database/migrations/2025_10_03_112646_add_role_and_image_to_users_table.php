<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            //  la migración base de Jetstream ya tiene name/email/password, aquí solo añadimos:
            $table->string('rol', 20)->default('cliente')->after('password'); // admin|vendedor|cliente
            // $table->string('imagen', 255)->nullable()->default('img/usuario.png')->after('rol');
            // fecha_registro = created_at (ya lo da $table->timestamps())
        });
    }
    public function down(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['rol','imagen']);
        });
    }
};

