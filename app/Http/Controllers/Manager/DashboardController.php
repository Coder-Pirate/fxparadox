<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('manager/dashboard', [
            'stats' => [
                'totalUsers' => User::where('role', 'user')->count(),
                'totalManagers' => User::where('role', 'manager')->count(),
            ],
        ]);
    }
}
