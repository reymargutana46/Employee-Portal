<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $roles): Response
    {

        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. User not authenticated.',
            ], 401);
        }

        $roleList = explode('|', $roles);

        // Debug logging - check Auth user
        \Log::info('Role check - Auth user', [
            'user' => Auth::user(),
            'user_id' => Auth::user()->username,
        ]);

        // Get user roles (case-sensitive from database)
        $userRoles = Auth::user()->roles()->pluck('name')->toArray();

        // Debug logging
        \Log::info('Role check - Start', [
            'user_id' => Auth::user()->username,
            'user_roles' => $userRoles,
            'required_roles' => $roleList
        ]);

        // Special handling for Faculty role - check if user has Faculty role
        if (in_array('Faculty', $roleList)) {
            $hasFacultyRole = Auth::user()->hasRole('Faculty');
            \Log::info('Role check - Faculty special check', [
                'has_faculty_role' => $hasFacultyRole
            ]);
            if ($hasFacultyRole) {
                $hasAnyRole = true;
            } else {
                // Continue with normal role checking
                $hasAnyRole = false;
                foreach ($userRoles as $userRole) {
                    foreach ($roleList as $requiredRole) {
                        if (strtolower($userRole) === strtolower($requiredRole)) {
                            $hasAnyRole = true;
                            \Log::info('Role check - Match found', [
                                'user_role' => $userRole,
                                'required_role' => $requiredRole
                            ]);
                            break 2;
                        }
                    }
                }
            }
        } else {
            // Normal role checking for non-Faculty roles
            $hasAnyRole = false;
            foreach ($userRoles as $userRole) {
                foreach ($roleList as $requiredRole) {
                    if (strtolower($userRole) === strtolower($requiredRole)) {
                        $hasAnyRole = true;
                        \Log::info('Role check - Match found', [
                            'user_role' => $userRole,
                            'required_role' => $requiredRole
                        ]);
                        break 2;
                    }
                }
            }
        }

        \Log::info('Role check - Result', [
            'has_role' => $hasAnyRole
        ]);

        if (!$hasAnyRole) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. You don’t have the required role(s).',
                'required_roles' => $roleList,
            ], 403);
        }

        return $next($request);
    }
}
