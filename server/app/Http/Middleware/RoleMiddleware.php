<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
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

        if (!auth()->check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. User not authenticated.',
            ], 401);
        }

        $roleList = explode('|', $roles);

        $hasAnyRole = auth()->user()->roles()->whereIn('name', $roleList)->exists();

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
