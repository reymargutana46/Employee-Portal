<?php

namespace Database\Seeders;

use App\Models\Position;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $positions = [
            'Teacher I',
            'Teacher II',
            'Teacher III',
            'Master Teacher I',
            'Master Teacher II',
            'SPED Teacher I',
            'SPET I',
            'Administrative Aide IV',
            'Administrative Officer II',
            'Principal I',
            'Principal II',
            'District Clerk',
            'Public School District Supervision',
            'Project Development Officer',
            'Nurse II',
            'J.O (Job Order)',
        ];
        foreach($positions as $position)
        Position::firstOrCreate([
            'title' => $position
        ]);
    }
}
