<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

class UserApprovalController extends Controller
{
    public function approve(User $user): RedirectResponse
    {
        $user->update(['is_approved' => true]);

        return back()->with('success', "User {$user->name} has been approved.");
    }

    public function reject(User $user): RedirectResponse
    {
        $user->update(['is_approved' => false]);

        return back()->with('success', "User {$user->name} has been rejected.");
    }

    public function activate(User $user): RedirectResponse
    {
        $user->update(['is_active' => true]);

        return back()->with('success', "User {$user->name} has been activated.");
    }

    public function deactivate(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot deactivate yourself.');
        }

        $user->update(['is_active' => false]);

        return back()->with('success', "User {$user->name} has been deactivated.");
    }
}
