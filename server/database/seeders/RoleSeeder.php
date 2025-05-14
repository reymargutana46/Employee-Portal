<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Admin',

            ],
            [
                'name' => 'Principal',

            ],
            [
                'name' => 'Campus Secretary',

            ],
            [
                'name' => 'Faculty',

            ],
            [
                'name' => 'Staff',

            ],

            [
                'name' => 'Secretary',

            ],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}
