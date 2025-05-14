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
            'Teacher',
            'Principal',
            'Vice Principal',
            'Guidance Counselor',
            'Registrar',
            'Secretary',
            'School Nurse',
            'IT Staff',
            'Librarian'
        ];
        foreach($positions as $position)
        Position::create([
            'title' =>$position,


        ]);
    }
}
