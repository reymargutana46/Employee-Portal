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
        Schema::create('leave_rejections', function (Blueprint $table) {
            $table->id();
            $table->string("rejected_by");
            $table->foreign('rejected_by')->references('username')->on('users')->onDelete('cascade');
            $table->foreignId('leave_id')->references('id')->on('leaves')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_rejections');
    }
};
