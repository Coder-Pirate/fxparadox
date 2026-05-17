<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PositionCalculatorController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        return Inertia::render('user/position-calculator', [
            'accounts'       => $user->accountBalances()->orderBy('account_name')->get(['id', 'account_name', 'balance']),
            'pairs'          => $user->tradingPairs()->orderBy('name')->pluck('name'),
            'defaultRiskPct' => $user->default_risk_pct ?? 1,
        ]);
    }
}
