<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\TradeJournal;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();
        $journals = $user->tradeJournals();

        // Overall stats
        $totalTrades = $journals->count();
        $winTrades = $journals->clone()->where('result', 'profit')->count();
        $lossTrades = $journals->clone()->where('result', 'loss')->count();
        $winRate = $totalTrades > 0 ? round(($winTrades / $totalTrades) * 100, 1) : 0;
        $daysTraded = $journals->clone()->distinct('trade_date')->count('trade_date');

        $totalProfit = $journals->clone()->where('result', 'profit')->sum('profit_loss_amount');
        $totalLoss = $journals->clone()->where('result', 'loss')->sum('profit_loss_amount');
        $netPnl = $totalProfit - $totalLoss;

        // Account balances
        $accounts = $user->accountBalances()->get(['id', 'account_name', 'balance']);

        // Calendar month from query or current month
        $month = $request->input('month', now()->format('Y-m'));
        $monthDate = Carbon::createFromFormat('Y-m', $month)->startOfMonth();

        // Daily summary for the calendar month
        // Get all trades for the calendar month
        $monthTrades = $user->tradeJournals()
            ->whereYear('trade_date', $monthDate->year)
            ->whereMonth('trade_date', $monthDate->month)
            ->select('id', 'trade_date', 'pair', 'direction', 'result', 'profit_loss_amount', 'session')
            ->orderBy('trade_date')
            ->get();

        // Build daily summary with trade details
        $dailySummary = $monthTrades->groupBy(fn ($t) => $t->trade_date->format('Y-m-d'))
            ->map(fn ($trades, $date) => [
                'date' => $date,
                'total_trades' => $trades->count(),
                'total_profit' => (float) $trades->where('result', 'profit')->sum('profit_loss_amount'),
                'total_loss' => (float) $trades->where('result', 'loss')->sum('profit_loss_amount'),
                'net' => (float) $trades->where('result', 'profit')->sum('profit_loss_amount') - (float) $trades->where('result', 'loss')->sum('profit_loss_amount'),
                'trades' => $trades->map(fn ($t) => [
                    'id' => $t->id,
                    'pair' => $t->pair,
                    'direction' => $t->direction,
                    'result' => $t->result,
                    'profit_loss_amount' => (float) $t->profit_loss_amount,
                    'session' => $t->session,
                ])->values(),
            ])->values();

        return Inertia::render('user/dashboard', [
            'stats' => [
                'totalTrades' => $totalTrades,
                'winTrades' => $winTrades,
                'lossTrades' => $lossTrades,
                'winRate' => $winRate,
                'daysTraded' => $daysTraded,
                'totalProfit' => (float) $totalProfit,
                'totalLoss' => (float) $totalLoss,
                'netPnl' => (float) $netPnl,
            ],
            'accounts' => $accounts,
            'dailySummary' => $dailySummary,
            'currentMonth' => $month,
        ]);
    }
}
