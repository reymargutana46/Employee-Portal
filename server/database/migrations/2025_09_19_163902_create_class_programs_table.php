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
        Schema::create('class_programs', function (Blueprint $table) {
            $table->id();
            $table->string('grade_section');
            $table->string('school_year');
            $table->string('adviser_teacher');
            $table->integer('male_learners')->default(0);
            $table->integer('female_learners')->default(0);
            $table->integer('total_learners')->default(0);
            $table->json('schedule_data'); // Stores the complete table schedule as JSON
            $table->string('created_by');
            $table->foreign('created_by')->references('username')->on('users')->onDelete('cascade');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_programs');
    }
};
