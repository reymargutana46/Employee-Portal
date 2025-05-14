<?php

namespace Database\Seeders;

use App\Models\Leaves\LeaveType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LeaveTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            'Vacation',
            'Sick Leave',
            'Maternity Leave',
            'Paternity Leave',
            'Bereavement Leave',
            'Emergency Leave',
            'Unpaid Leave'
        ];

        foreach ($types as $type) {
            LeaveType::create(['name' => $type]);
        }
    }
}
