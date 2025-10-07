<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('work_load_hdrs', function (Blueprint $table) {
            $table->string('status')->default('PENDING'); // PENDING | APPROVED | REJECTED
            $table->string('approval_remarks')->nullable();

            $table->string('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();

            $table->string('rejected_by')->nullable();
            $table->timestamp('rejected_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('work_load_hdrs', function (Blueprint $table) {
            $table->dropColumn(['status', 'approval_remarks', 'approved_by', 'approved_at', 'rejected_by', 'rejected_at']);
        });
    }
};
