<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TradingSettingsController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        return Inertia::render('user/trading-settings', [
            'pairs' => $user->tradingPairs()->orderBy('name')->get(),
            'sessions' => $user->tradingSessions()->orderBy('name')->get(),
            'accounts' => $user->accountBalances()->orderBy('account_name')->get(),
        ]);
    }
}
