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
        Schema::create('faculty_wls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workload_id')->references('id')->on('work_load_hdrs')->onDelete('cascade');
            $table->string('subject');
            $table->timestamp('sched_from');
            $table->timestamp('sched_to');
            $table->integer('quarter');
            $table->integer('acadyearId');
            $table->foreignId('room_id')->references('id')->on('rooms')->onDelete('cascade');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faculty_wls');
    }
};
