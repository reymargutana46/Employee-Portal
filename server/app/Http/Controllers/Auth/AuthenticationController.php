<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\BaseController;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Str;

class AuthenticationController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required',

        ]);
        
        // Use whereRaw with LOWER to make username comparison case-insensitive
        // Include soft-deleted users to check if account is deactivated
        $user = User::withTrashed()->with([
            'employee',
            'employee.workhour',
            'employee.department',
            'employee.position',
            'roles',
        ])->whereRaw('LOWER(username) = ?', [strtolower($request->username)])->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if the user account is deactivated (soft deleted)
        if ($user->trashed()) {
            throw ValidationException::withMessages([
                'username' => ['Your account has been deactivated. Please contact an administrator.'],
            ]);
        }

        // Check if the user account is marked as inactive
        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'username' => ['Your account is inactive. Please contact an administrator.'],
            ]);
        }

        // For traditional web applications using sessions
        Auth::login($user);
        $token = $user->createToken('auth_token')->plainTextToken;
        
        // Log for debugging reactivated users
        if (!$user->employee) {
            \Log::warning("Login successful but no employee record found for user: {$user->username}");
        }

        $data = [
            'token' => $token,
            'user' => [
                'username' => $user->username,
                'fullname' => $user->employee ? $user->employee->getFullName() : $user->username,
                'firstname' => $user->employee ? $user->employee->fname : '',
                'lastname' => $user->employee ? $user->employee->lname : '',
                'middlename' => $user->employee ? $user->employee->mname : '',
                'extension' => $user->employee ? $user->employee->extname : '',
                'employee_id' => $user->employee ? $user->employee->id : null,
                'email' => $user->employee ? $user->employee->email : '',
                'profile_picture' => $user->employee && $user->employee->profile_picture ? asset('storage/' . $user->employee->profile_picture) : null,
                'roles' => $user->roles->map(fn($role) => ['name' => Str::lower($role->name)]),
            ],
        ];
        return $this->ok($data);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function accounts()
    {

        $users = User::with(['employee', 'roles'])->get();
        return $this->ok(UserResource::collection($users), 'Users retrieved successfully');
    }
}