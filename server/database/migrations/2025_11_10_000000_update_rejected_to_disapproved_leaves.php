<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update all leaves with status 'Rejected' to 'Disapproved'
        DB::table('leaves')
            ->where('status', 'Rejected')
            ->update(['status' => 'Disapproved']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert all leaves with status 'Disapproved' back to 'Rejected'
        DB::table('leaves')
            ->where('status', 'Disapproved')
            ->update(['status' => 'Rejected']);
    }
};