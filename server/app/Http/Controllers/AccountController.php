<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\Employee;
use App\Models\Leaves\Leave;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\Workhour;
use App\Models\Department;
use App\Models\Position;
use App\Models\WorkLoadHdr;
use App\Models\DtrAmtime;
use App\Models\DtrPmtime;
use Illuminate\Support\Carbon;
use Auth;
use Illuminate\Http\Request;
use App\Http\Resources\EmployeeResource;
use Illuminate\Support\Facades\DB;
use App\Services\DashboardService;
use Illuminate\Support\Facades\Hash;

class AccountController extends Controller
{
    protected $DashboardService;
    public function __construct(DashboardService $DashboardService)
    {
        $this->DashboardService = $DashboardService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::with(['employee', 'roles'])->get();
        return $this->ok(UserResource::collection($users), 'Users retrieved successfully');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'currentPassword' => 'required',
            'newPassword' => 'required|min:8',
        ]);

        $auth = Auth::user();
        $user = User::where('username', $auth->username)->first();

        // Check if user exists and current password is correct
        if (!$user || !Hash::check($request->currentPassword, $user->password)) {
            return $this->unauthorized('Current password is incorrect');
        }

        // Additional validation to ensure new password is not empty
        if (empty($request->newPassword)) {
            return $this->unauthorized('New password is required');
        }

        // Check if new password is different from current password
        if (Hash::check($request->newPassword, $user->password)) {
            return $this->unauthorized('New password must be different from current password');
        }

        try {
            // Update password with consistent naming
            $user->password = Hash::make($request->newPassword);
            $user->save();

            // Optional: Log out other devices for security
            // Auth::logoutOtherDevices($request->newPassword);

            // Optional: Log the password change activity
            // Log::info('Password changed for user: ' . $user->username);

            return $this->ok(null, 'Password changed successfully');
        } catch (\Exception $e) {
            // Log the error for debugging

            return $this->badRequest('Failed to change password. Please try again.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $username)
    {
        $user = User::where('username', $username)->first();
        if (!$user) {
            return $this->notFound('User not found');
        }
        $roleIds = collect($request->all())->pluck('id')->toArray(); // extract IDs
        $user->roles()->sync($roleIds);
        return $this->ok(new UserResource($user), 'User updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function dashboard()
    {
        $cards = $this->DashboardService->cards();
        $monthlyAttendance = $this->DashboardService->monthlyAttendance();
        return $this->ok([
            'card' => $cards,
            'monthlyAttendance' => $monthlyAttendance,
            'recentlogs' => $this->DashboardService->ActivityLogs(),
            'workloads' => $this->DashboardService->workloadsData(),
            'serviceRequests' => $this->DashboardService->getServiceRequestCountPerMonthByStatus(),
        ]);
    }



    public function me(Request $request)
    {
        $employee = Employee::with(['position', 'department', 'workhour', 'user'])->whereUsernameId(Auth::user()->username)->first();

        return $this->ok(new EmployeeResource($employee), 'User retrieved successfully');
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:employees,id',
            'fname' => 'required|string',
            'lname' => 'required|string',
            'mname' => 'nullable|string',
            'extname' => 'nullable|string',

            'contactno' => 'required|string',
            'telno' => 'nullable|string',
            'email' => 'required|email',
            'department' => 'required|string',
            'position' => 'required|string',
            'workhours_id' => 'required',
            'workhours_am' => 'required',
            'workhours_pm' => 'required',
            'username' => 'required|string',
        ]);

        DB::transaction(function () use ($validated) {
            $employee = Employee::findOrFail($validated['id']);

            // Update User
            $user = User::where('username', $validated['username'])->firstOrFail();
            $user->update(['username' => $validated['username']]);

            // Update Workhour
            $workhour = Workhour::findOrFail($validated['workhours_id']);
            $workhour->update([
                'am' => $validated['workhours_am'],
                'pm' => $validated['workhours_pm'],
            ]);

            // Find Department and Position
            $department = Department::where('name', $validated['department'])->firstOrFail();
            $position = Position::where('title', $validated['position'])->firstOrFail();

            // Update Employee
            $employee->update([
                'fname' => $validated['fname'],
                'lname' => $validated['lname'],
                'mname' => $validated['mname'],
                'extname' => $validated['extname'],

                'contactno' => $validated['contactno'],
                'telno' => $validated['telno'],
                'email' => $validated['email'],
                'department_id' => $department->id,
                'position_id' => $position->id,
                'username_id' => $user->username,
                'workhour_id' => $workhour->id,
            ]);
        });

        // Re-fetch updated employee for response
        $employee = Employee::with(['department', 'position', 'workhour', 'user'])->find($validated['id']);

        return $this->ok(new EmployeeResource($employee), 'Profile updated successfully');
    }
}
