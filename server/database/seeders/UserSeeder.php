<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use App\Models\Role;
use App\Models\User;
use App\Models\Workhour;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        // Get the ICT Admin role
        $ictAdmin = Role::where('name', 'Admin')->first();

        // Create the User
        $adminUser = User::create([
            'username' => 'Admin',

            'password' => Hash::make('password'),
        ]);

        // Attach the role
        $adminUser->roles()->attach($ictAdmin);

        // Create Position
        $position = Position::create([
            'title' => 'Admin',
        ]);

        $department = Department::create([
            'name' => 'Admin Department',
        ]);

        // Create Workhour
        $workhour = Workhour::create([
            'am' => '7:30',
            'pm' => '4:30',
        ]);

        // Create Employee (assuming username_id is user id)
        Employee::create([
            'fname' => 'admin',
            'lname' => 'admin',
            'mname' => 'admin',

            'username_id' => $adminUser->username, // 👈 Changed from $adminUser->username
            'biod' => '1144',
            'workhour_id' => $workhour->id,
            'position_id' => $position->id,
            'department_id' => $department->id,
            'email' => 'admin@example.com',
            'contactno' => '13123',
            'telno' => '51123',
        ]);



        // Create Principal
        // $principalUser = User::create([
        //     'username' => 'Principal01',
        //     'email' => 'principal@example.com',
        //     'password' => Hash::make('password'),
        // ]);
        // $principalUser->roles()->attach($principal);

        // // Create Secretary
        // $secretaryUser = User::create([
        //     'username' => 'Secretary01',
        //     'email' => 'secretary@example.com',
        //     'password' => Hash::make('password'),
        // ]);
        // $secretaryUser->roles()->attach($secretary);

        // // Create Faculty
        // $facultyUser = User::create([
        //     'username' => 'Faculty01',
        //     'email' => 'faculty@example.com',
        //     'password' => Hash::make('password'),
        // ]);
        // $facultyUser->roles()->attach($faculty);

        // // Create Staff
        // $staffUser = User::create([
        //     'username' => 'Staff01',
        //     'email' => 'staff@example.com',
        //     'password' => Hash::make('password'),
        // ]);
        // $staffUser->roles()->attach($staff);
    }
}
