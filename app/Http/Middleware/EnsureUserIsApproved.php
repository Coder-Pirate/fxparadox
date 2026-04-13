<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsApproved
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->isAdmin()) {
            if (! $user->isActive()) {
                auth()->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')->with('status', 'Your account has been deactivated. Please contact an administrator.');
            }

            if (! $user->isApproved()) {
                if ($request->expectsJson()) {
                    return response()->json(['message' => 'Your account is pending approval.'], 403);
                }

                return redirect()->route('approval.pending');
            }
        }

        return $next($request);
    }
}
