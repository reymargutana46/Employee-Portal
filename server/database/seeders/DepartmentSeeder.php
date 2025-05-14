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
        $departments = [
            "Department1",
            "Department2",
            "Department3",
            "Department4",
            "Department5",
            "Department6"
        ];

        foreach($departments as $department)
        {
            Department::create([
                'name'=> $department,

            ]);
        }
    }
}
