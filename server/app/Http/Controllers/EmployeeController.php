<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmployeeStoreRequest;
use App\Http\Requests\EmployeeUpdateRequest;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use App\Models\Role;
use App\Models\User;
use App\Models\Workhour;
use App\Services\EmployeeService;
use DB;
use Hash;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{

    protected $employeeService;

    public function __construct(EmployeeService $employeeService)
    {
        $this->employeeService = $employeeService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $employees = Employee::with(['position', 'department', 'workhour', 'user'])->get();

        $data = $employees->map(function ($employee) {
            return [
                'id' => $employee->id,
                'fname' => $employee->fname,
                'lname' => $employee->lname,
                'mname' => $employee->mname,
                'extname' => $employee->extname,
                'username' => $employee->user->username ?? null,
                'biod' => $employee->biod,
                'position' => $employee->position->title ?? null,
                'department' => $employee->department->name ?? null,
                'email' => $employee->email,
                'contactno' => $employee->contactno,
                'workhours_am' => $employee->workhour->am ?? null,
                'workhours_pm' => $employee->workhour->pm ?? null,
                'telno' => $employee->telno,
            ];
        });
        return $this->ok($data);
    }



    /**
     * Store a newly created resource in storage.
     */
    public function store(EmployeeStoreRequest $request)
    {
        $request->validated();

        try {
            // echo $request;
            $employee = $this->employeeService->StoreEmployee($request);

            return $this->created($employee);
        } catch (\Throwable $th) {
            return $this->notFound($th->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $employee = Employee::findOrFail($id);
        return $this->ok($employee);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(EmployeeUpdateRequest $request, string $id)
    {
        $validated = $request->validated();
        $employee = Employee::findOrFail($id);
        $employee->update($validated);

        return $this->ok();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $employee = Employee::findOrFail($id);
        $employee = $employee->delete();

        return $this->ok();
    }
    public function roles(Request $request)
    {
        $roles = Role::all();
        return $this->ok($roles);
    }
}
