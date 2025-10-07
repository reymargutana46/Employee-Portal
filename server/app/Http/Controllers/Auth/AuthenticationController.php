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
        // $user = User::with([
        //     'employee' => function ($query) {
        //         $query->where('status', 'active')->with('department');
        //     }
        $user = User::with([
            'employee',
            'employee.workhour',
            'employee.department',
            'employee.position',
            'roles',
        ])->where('username', $request->username)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['The provided credentials are incorrect.'],
            ]);
        }



        // For traditional web applications using sessions
        Auth::login($user);
        $token = $user->createToken('auth_token')->plainTextToken;
        // echo $user;
        $data = [
            'token' => $token,
            'user' => [
                'username' => $user->username,
                'fullname' => $user->employee->getFullName(),
                'lastname' => $user->employee->lname,
                'employee_id' => $user->employee->id,
                'email' => $user->employee->email,
                'profile_picture' => $user->employee->profile_picture ? asset('storage/' . $user->employee->profile_picture) : null,
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
