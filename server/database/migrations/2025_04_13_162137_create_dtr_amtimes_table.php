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
        Schema::create('dtr_amtimes', function (Blueprint $table) {
            $table->id();
            $table->timestamp('time_in');
            $table->timestamp('time_out');
            $table->foreignId('employee_id')->references('id')->on('employees')->onDelete('cascade');

            $table->softDeletes();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dtr_amtimes');
    }
};
