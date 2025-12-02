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
        // Add indexes for better DTR import performance
        DB::statement('CREATE INDEX IF NOT EXISTS idx_dtrecords_employee_id ON dtrecords(employee_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_dtrecords_date ON dtrecords(date)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_employees_biometric_id ON employees(biometric_id)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes
        DB::statement('DROP INDEX IF EXISTS idx_dtrecords_employee_id');
        DB::statement('DROP INDEX IF EXISTS idx_dtrecords_date');
        DB::statement('DROP INDEX IF EXISTS idx_employees_biometric_id');
    }
};