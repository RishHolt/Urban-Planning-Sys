<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectByRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $role = $user->role ?? 'citizen';

            // Redirect admin and staff to admin page
            // Exclude admin routes, logout, profile, and home route
            if (in_array($role, ['admin', 'staff'])) {
                if (! $request->routeIs('admin.*') &&
                    ! $request->routeIs('logout') &&
                    ! $request->routeIs('profile.*') &&
                    ! $request->routeIs('home')) {
                    return redirect()->route('admin.home');
                }
            }

            // Redirect regular users (citizens) to user page
            // Exclude user routes, applications routes (for users), logout, profile, and home route
            if ($role === 'citizen') {
                if (! $request->routeIs('user.*') &&
                    ! $request->routeIs('applications.*') &&
                    ! $request->routeIs('logout') &&
                    ! $request->routeIs('profile.*') &&
                    ! $request->routeIs('home')) {
                    return redirect()->route('user.home');
                }
            }
        }

        return $next($request);
    }
}
