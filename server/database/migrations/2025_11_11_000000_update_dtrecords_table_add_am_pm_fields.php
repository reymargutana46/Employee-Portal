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
        Schema::table('dtrecords', function (Blueprint $table) {
            // Remove the old time_in and time_out fields
            $table->dropColumn(['time_in', 'time_out']);
            
            // Add new AM/PM time fields
            $table->time('am_time_in')->nullable();
            $table->time('am_time_out')->nullable();
            $table->time('pm_time_in')->nullable();
            $table->time('pm_time_out')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dtrecords', function (Blueprint $table) {
            // Remove the new AM/PM time fields
            $table->dropColumn(['am_time_in', 'am_time_out', 'pm_time_in', 'pm_time_out']);
            
            // Add back the old time_in and time_out fields
            $table->time('time_in');
            $table->time('time_out')->nullable();
        });
    }
};