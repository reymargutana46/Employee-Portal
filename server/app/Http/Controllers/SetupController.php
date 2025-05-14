<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Position;
use App\Models\Role;
use App\Models\Room;
use Illuminate\Http\Request;

class SetupController extends Controller
{
    public function roles()
    {
        $roles = Role::all();
        return $this->ok($roles);
    }

    public function departments()
    {
        $department = Department::all();
        return $this->ok($department);
    }

    public function positions()
    {
        $positions = Position::all();
        return $this->ok($positions);
    }

    public function rooms()
    {
        $rooms = Room::all();
        return $this->ok($rooms);
    }
}
