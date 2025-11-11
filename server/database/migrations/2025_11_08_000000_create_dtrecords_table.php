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
        Schema::create('dtrecords', function (Blueprint $table) {
            $table->id(); // Auto-incrementing primary key
            $table->string('employee_name');
            $table->unsignedBigInteger('employee_id');
            $table->date('date');
            $table->time('time_in');
            $table->time('time_out')->nullable(); // Optional, can be null
            $table->timestamp('created_at')->nullable(); // Optional
            $table->timestamp('updated_at')->nullable(); // Optional
            
            // Add foreign key constraint
            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dtrecords');
    }
};