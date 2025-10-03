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
        Schema::create('service_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_to')->references('id')->on('employees')->onDelete('cascade');
            $table->string('request_by');
            $table->foreign('request_by')->references('username')->on('users')->onDelete('cascade');
            $table->string('title');
            $table->string('priority');
            $table->string('status');
            $table->string('remarks');
            $table->integer('rating');
            $table->date('from');
            $table->date('to');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_request');
    }
};
