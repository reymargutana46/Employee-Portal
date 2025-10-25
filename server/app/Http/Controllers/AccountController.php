<?php

namespace App\Http\Controllers;

use App\Http\Resources\EmployeeResource;
use App\Http\Resources\UserResource;
use App\Models\ActivityLog;
use App\Models\Employee;
use App\Models\Position;
use App\Models\Role;
use App\Models\User;
use App\Models\Workhour;
use App\Services\DashboardService;
use Auth;
use DB;
use Hash;
use Illuminate\Http\Request;
use Str;

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
        // Get all employees with their associated user accounts and roles
        $employees = Employee::with(['user.roles', 'department', 'position'])
            ->get()
            ->map(function ($employee) {
                return [
                    'employee_id' => $employee->id,
                    'username' => $employee->user->username ?? null,
                    'fullname' => $employee->getFullName(),
                    'firstname' => $employee->fname,
                    'lastname' => $employee->lname,
                    'middlename' => $employee->mname,
                    'extension' => $employee->extname,
                    'email' => $employee->email,
                    'contactno' => $employee->contactno,
                    'department' => $employee->department->name ?? null,
                    'position' => $employee->position->title ?? null,
                    'has_account' => $employee->user !== null,
                    'profile_picture' => $employee->profile_picture ? asset('storage/' . $employee->profile_picture) : null,
                    'roles' => $employee->user ? $employee->user->roles : [],
                    'created_at' => $employee->created_at,
                    'updated_at' => $employee->updated_at,
                ];
            });

        return $this->ok($employees, 'Employees and accounts retrieved successfully');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'username' => 'required|unique:users,username',
            'password' => 'required|min:8',
        ]);

        try {
            DB::transaction(function () use ($request) {
                $employee = Employee::findOrFail($request->employee_id);

                // Create user account
                $user = User::create([
                    'username' => $request->username,
                    'password' => Hash::make($request->password),
                ]);

                // Associate employee with user account
                $employee->update(['username_id' => $user->username]);

                // Assign default role if provided
                if ($request->has('role_id')) {
                    $user->roles()->attach($request->role_id);
                }

                ActivityLog::create([
                    'performed_by' => Auth::user()->username,
                    'action' => 'created',
                    'description' => "Created user account for employee {$employee->fname} {$employee->lname}",
                    'entity_type' => User::class,
                    'entity_id' => $user->username,
                ]);
            });

            return $this->ok(null, 'User account created successfully');
        } catch (\Exception $e) {
            return $this->badRequest($e->getMessage());
        }
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
    public function destroy(string $idOrUsername)
    {
        try {
            DB::transaction(function () use ($idOrUsername) {
                $user = null;
                $employee = null;

                if (is_numeric($idOrUsername)) {
                    // Handle case where frontend sends employee ID instead of username
                    $employee = Employee::findOrFail($idOrUsername);
                    if ($employee->username_id) {
                        $user = User::withTrashed()->where('username', $employee->username_id)->first();
                    }
                } else {
                    // Handle normal case using username
                    $user = User::withTrashed()->where('username', $idOrUsername)->first();
                    $employee = $user ? $user->employee : null;
                }

                if (!$user) {
                    throw new \Exception('User not found');
                }

                // Remove user account but keep employee record
                if ($employee) {
                    $employee->update(['username_id' => null]);
                }

                ActivityLog::create([
                    'performed_by' => Auth::user()->username,
                    'action' => 'deleted',
                    'description' => "Deleted user account for {$idOrUsername}",
                    'entity_type' => User::class,
                    'entity_id' => is_numeric($idOrUsername) ? ($employee->username_id ?? '') : $idOrUsername,
                ]);

                // Permanently delete even if soft-deleted
                $user->forceDelete();
            });

            return $this->ok(null, 'User account deleted successfully');
        } catch (\Exception $e) {
            \Log::error('Account deletion error: ' . $e->getMessage());
            return $this->badRequest($e->getMessage());
        }
    }

    public function dashboard(Request $request)
    {
        try {
            // Get quarter parameter from request, default to null
            $quarter = $request->query('quarter', null);
            
            // Convert to integer if provided
            if ($quarter !== null) {
                $quarter = (int) $quarter;
            }
            
            $cards = $this->DashboardService->cards();
            $monthlyAttendance = $this->DashboardService->MonthlyAttendance($quarter);
            
            return $this->ok([
                'card' => $cards,
                'monthlyAttendance' => $monthlyAttendance,
                'recentlogs' => $this->DashboardService->ActivityLogs(),
                'workloads' => $this->DashboardService->workloadsData(),
                'serviceRequests' => $this->DashboardService->getServiceRequestCountPerMonthByStatus(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Dashboard data error: ' . $e->getMessage());
            return $this->badRequest('Failed to load dashboard data: ' . $e->getMessage());
        }
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
            'contactno' => 'required|string|digits:10',
            'telno' => 'nullable|string',
            'email' => 'required|email',
            'department' => 'required|string',
            'position' => 'required|string',
            'workhours_id' => 'required',
            'workhours_am' => 'required',
            'workhours_pm' => 'required',
            'username' => 'required|string',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
        ]);

        DB::transaction(function () use ($validated, $request) {
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

            // Handle profile picture upload if present
            $profilePicturePath = $employee->profile_picture; // Keep existing if no new upload
            if ($request->hasFile('profile_picture')) {
                // Delete old profile picture if exists
                if ($employee->profile_picture && file_exists(storage_path('app/public/' . $employee->profile_picture))) {
                    unlink(storage_path('app/public/' . $employee->profile_picture));
                }
                
                // Store new profile picture
                $profilePicturePath = $request->file('profile_picture')->store('profile_pictures', 'public');
            }

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
                'workhour_id' => $workhour->id,
                'profile_picture' => $profilePicturePath,
            ]);

            ActivityLog::create([
                'performed_by' => Auth::user()->username,
                'action' => 'updated',
                'description' => "Updated profile for employee {$employee->fname} {$employee->lname}",
                'entity_type' => Employee::class,
                'entity_id' => $employee->id,
            ]);
        });

        return $this->ok(null, 'Profile updated successfully');
    }
}