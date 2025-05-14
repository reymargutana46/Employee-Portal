<?php

namespace App\Services;

use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use App\Models\Role;
use App\Models\User;
use App\Models\Workhour;
use DB;
use Hash;

class EmployeeService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function fetchByFullname(string $employee_fullname)
    {
        $fullName = preg_replace('/\s+/', ' ', trim($employee_fullname)); // Normalize spacing
        $fullNameLower = strtolower($fullName);



        $employee = Employee::where(function ($query) use ($fullNameLower) {
            $query->orWhereRaw("LOWER(CONCAT_WS(' ', extname, fname, lname)) = ?", [$fullNameLower])
                ->orWhereRaw("LOWER(CONCAT_WS(' ', fname, lname)) = ?", [$fullNameLower])
                ->orWhereRaw("LOWER(CONCAT_WS(' ', fname, mname, lname)) = ?", [$fullNameLower])
                ->orWhereRaw("LOWER(CONCAT_WS(' ', extname, fname, mname, lname)) = ?", [$fullNameLower]);
        })->first();

        return $employee;
    }
    public function StoreEmployee($request)
    {
        return DB::transaction(function () use ($request) {
            $role = Role::where('name', $request->role)->first();
            if (!$role) {
                throw new \Exception("Department '{$request->department}' not found");
            }
            $user = User::create([
                'username' => $request->username,
                'password' => Hash::make($request->password),
            ]);

            $user->roles()->attach($role);

            $position = Position::whereTitle($request->position)->first();
            if (!$position) {
                throw new \Exception("Position '{$request->position}' not found");
            }

            $department = Department::whereName($request->department)->first();
            if (!$department) {
                throw new \Exception("Department '{$request->department}' not found");
            }

            $workhour = Workhour::create([
                'am' => $request->workhour_am,
                'pm' => $request->workhour_pm,
            ]);

            $employee = Employee::create([
                'fname' => $request->fname,
                'lname' => $request->lname,
                'mname' => $request->extname ? str_replace('.', '', strtolower(trim($request->extname))) : null,
                'extname'=> $request->extname,
                'username_id' => $user->username,
                'biod' => '1144',
                'workhour_id' => $workhour->id,
                'position_id' => $position->id,
                'department_id' => $department->id,
                'email' => $request->email,
                'contactno' => $request->contactno,
                'telno' => $request->telno,
            ]);

           return [
                'id' => $employee->id,
                'fname' => $employee->fname,
                'lname' => $employee->lname,
                'mname' => $employee->mname,
                'extname' => $employee->extname,
                'username' => $employee->user->username ?? null,
                'biod' => $employee->biod,
                'position' => $position->title ?? null,
                'department' => $department->name ?? null,
                'email' => $employee->email,
                'contactno' => $employee->contactno,
                'workhours_am' =>  $request->workhour_am ?? null,
                'workhours_pm' => $request->workhour_pm ?? null,
                'telno' => $employee->telno,
            ];
            // return $data;
        });
    }
}
