<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\PersonalDataSheet;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get all PDS records
        $pdsRecords = PersonalDataSheet::all();
        
        foreach ($pdsRecords as $pds) {
            // Find the user who uploaded this PDS
            $user = User::where('username', $pds->uploader)->first();
            
            if ($user) {
                // Get the correct full name
                $correctName = $user->username; // Default to username
                if ($user->employee) {
                    $correctName = $user->employee->getFullName();
                }
                
                // Update the owner_name if it's different
                if ($pds->owner_name !== $correctName) {
                    $pds->owner_name = $correctName;
                    $pds->save();
                    echo "Updated PDS ID {$pds->id}: {$pds->owner_name} -> {$correctName}\n";
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration cannot be reversed
    }
};