<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Building structure with Grade Levels and Sections
        $buildingSections = [
            // Kindergarten Sections
            "KINDER - GENEROUS AM",
            "KINDER - GENEROUS PM",
            "KINDER - GOOD AM",
            "KINDER - GOOD PM",
            "KINDER - GREAT AM",
            "KINDER - GREAT PM",
            "KINDER - SPED-KINDERGARTEN (DHH) SPED",
            
            // Grade 1 Sections
            "GRADE 1 - ADMIRABLE",
            "GRADE 1 - ADORABLE",
            "GRADE 1 - AFFECTIONATE",
            "GRADE 1 - ALERT",
            "GRADE 1 - AMAZING",
            "GRADE 1 - SPED (GRADED) SPED",
            
            // Grade 2 Sections
            "GRADE 2 - BELOVED",
            "GRADE 2 - BENEFICENT",
            "GRADE 2 - BENEVOLENT",
            "GRADE 2 - BLESSED",
            "GRADE 2 - BLESSFUL",
            "GRADE 2 - BLOSSOM",
            "GRADE 2 - SPED-GRADE 2 (DHH) SPED",
            
            // Grade 3 Sections
            "GRADE 3 - CALM",
            "GRADE 3 - CANDOR",
            "GRADE 3 - CHARITABLE",
            "GRADE 3 - CHEERFUL",
            "GRADE 3 - CLEVER",
            "GRADE 3 - CURIOUS",
            
            // Grade 4 Sections
            "GRADE 4 - DAINTY",
            "GRADE 4 - DEDICATED",
            "GRADE 4 - DEMURE",
            "GRADE 4 - DEVOTED",
            "GRADE 4 - DYNAMIC",
            "GRADE 4 - SPED (GRADED) SPED",
            
            // Grade 5 Sections
            "GRADE 5 - EFFECTIVE",
            "GRADE 5 - EFFICIENT",
            "GRADE 5 - ENDURANCE",
            "GRADE 5 - ENERGETIC",
            "GRADE 5 - EVERLASTING",
            
            // Grade 6 Sections
            "GRADE 6 - FAIR",
            "GRADE 6 - FAITHFUL",
            "GRADE 6 - FLEXIBLE",
            "GRADE 6 - FORBEARANCE",
            "GRADE 6 - FORTITUDE",
            "GRADE 6 - FRIENDLY",
            
            // Non-Graded SPED Sections
            "NON-GRADED - GRACIOUS SPED",
            "NON-GRADED - GRATEFUL SPED"
        ];

        // Cleanup legacy department names that should not appear
        Department::withTrashed()->whereIn('name', [
            'Department1','Department2','Department3','Department4','Department5','Department6'
        ])->delete();

        // Ensure Admin Department is renamed to ADMIN BUILDING, preserving relationships
        $admin = Department::withTrashed()->whereIn('name', ['Admin Department','ADMIN DEPARTMENT'])->first();
        if ($admin) {
            if ($admin->trashed()) {
                $admin->restore();
            }
            $admin->name = 'ADMIN BUILDING';
            $admin->save();
        } else {
            $admin = Department::withTrashed()->firstOrCreate(['name' => 'ADMIN BUILDING']);
            if ($admin->trashed()) {
                $admin->restore();
            }
        }

        foreach($buildingSections as $section)
        {
            $dept = Department::withTrashed()->firstOrCreate([
                'name' => $section,
            ]);

            if ($dept->trashed()) {
                $dept->restore();
            }
        }
    }
}
