<?php 
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::table('perfil_cliente', function (Blueprint $table) {
      // Nuevos campos (opcionales)
      $table->string('address_line1', 190)->nullable()->after('direccion');
      $table->string('address_line2', 190)->nullable()->after('address_line1');
      $table->string('city', 120)->nullable()->after('address_line2');
      $table->string('province', 120)->nullable()->after('city');
      $table->string('postal_code', 16)->nullable()->after('province');
      $table->string('country', 2)->nullable()->default('ES')->after('postal_code');
    });
  }

  public function down(): void
  {
    Schema::table('perfil_cliente', function (Blueprint $table) {
      $table->dropColumn(['address_line1','address_line2','city','province','postal_code','country']);
    });
  }
};
