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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('fname');
            $table->string('lname');
            $table->string('mname')->nullable();
            $table->string('extname')->nullable();
            $table->foreignId('username_id')->references('username')->on('users')->onDelete('cascade');
            $table->string('biod');
            $table->softDeletes();
            $table->foreignId('position_id')->references('id')->on('positions')->onDelete('cascade');
            $table->foreignId('department_id')->references('id')->on('departments')->onDelete('cascade');
            $table->foreignId('workhour_id')->references('id')->on('workhours')->onDelete('cascade');

            $table->string('email')->unique();
            $table->string('contactno');
            $table->string('telno');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee');
    }
};
