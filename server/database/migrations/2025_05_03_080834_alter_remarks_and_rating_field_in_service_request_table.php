<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->string('priority')->nullable()->change();
            $table->string('remarks')->nullable()->change();

            $table->integer('rating')->default(null)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->string('priority')->nullable(false)->change();
            $table->integer('rating')->default(null)->change();
            $table->string('remarks')->nullable()->change();
        });
    }
};
