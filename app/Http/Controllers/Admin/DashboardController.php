<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totalUsers' => \App\Models\User::count(),
                'totalAdmins' => \App\Models\User::where('role', 'admin')->count(),
                'totalManagers' => \App\Models\User::where('role', 'manager')->count(),
                'totalRegularUsers' => \App\Models\User::where('role', 'user')->count(),
                'pendingApproval' => \App\Models\User::where('is_approved', false)->where('role', '!=', 'admin')->count(),
                'inactiveUsers' => \App\Models\User::where('is_active', false)->where('role', '!=', 'admin')->count(),
            ],
        ]);
    }
}
