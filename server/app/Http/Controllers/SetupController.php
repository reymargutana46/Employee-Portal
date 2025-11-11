<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Position;
use App\Models\Role;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SetupController extends Controller
{
    public function roles()
    {
        $roles = Cache::remember('roles', 3600, function () {
            return Role::all();
        });
        return $this->ok($roles);
    }

    public function departments()
    {
        $departments = Cache::remember('departments', 3600, function () {
            return Department::all();
        });
        return $this->ok($departments);
    }

    public function positions()
    {
        $positions = Cache::remember('positions', 3600, function () {
            return Position::all();
        });
        return $this->ok($positions);
    }

    public function rooms()
    {
        $rooms = Cache::remember('rooms', 3600, function () {
            return Room::all();
        });
        return $this->ok($rooms);
    }
}
