<?php

namespace App\Services;

use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use App\Models\Role;
use App\Models\User;
use App\Models\Workhour;
use App\Models\ActivityLog;
use Auth;
use DB;
use Hash;

class EmployeeService
{


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

            return DB::transaction(function () use ($workhour, $request, $user, $position, $department) {
                $employee = Employee::create([
                    'fname' => $request->fname,
                    'lname' => $request->lname,
                    'mname' => $request->mname,
                    'extname' => $request->extname,
                    'username_id' => $user->username,
                    'bioid' => $request->biod,
                    'workhour_id' => $workhour->id,
                    'position_id' => $position->id,
                    'department_id' => $department->id,
                    'email' => $request->email,
                    'contactno' => $request->contactno,
                    'telno' => $request->telno,
                ]);

                ActivityLog::create([
                    'performed_by' => Auth::user()->username,
                    'action' => 'created',
                    'description' => "Created employee {$employee->fname} {$employee->lname}",
                    'entity_type' => Employee::class,
                    'entity_id' => $employee->id,
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
            });



            // return $data;
        });
    }
}
