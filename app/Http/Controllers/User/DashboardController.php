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
        $accounts = $user->accountBalances()->get(['id', 'account_name', 'balance', 'starting_balance']);

        // PnL periods
        $pnlPeriods = $this->calcPnl($user, $request);

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
            'pnlPeriods' => $pnlPeriods,
            'dailySummary' => $dailySummary,
            'currentMonth' => $month,
        ]);
    }

    private function calcPnl($user, $request): array
    {
        $now = now();

        // Custom period from query params
        $customFrom = $request->input('pnl_from');
        $customTo   = $request->input('pnl_to');

        $calc = function (\Carbon\CarbonInterface $from, \Carbon\CarbonInterface $to) use ($user) {
            $q = $user->tradeJournals()
                ->whereBetween('trade_date', [$from->toDateString(), $to->toDateString()]);
            $profit = (float) (clone $q)->where('result', 'profit')->sum('profit_loss_amount');
            $loss   = (float) (clone $q)->where('result', 'loss')->sum('profit_loss_amount');
            $trades = (clone $q)->count();
            return [
                'net'    => round($profit - $loss, 2),
                'profit' => round($profit, 2),
                'loss'   => round($loss, 2),
                'trades' => $trades,
            ];
        };

        $result = [
            'today'     => $calc($now->copy()->startOfDay(), $now->copy()->endOfDay()),
            'yesterday' => $calc($now->copy()->subDay()->startOfDay(), $now->copy()->subDay()->endOfDay()),
            'lastWeek'  => $calc($now->copy()->subWeek()->startOfWeek(), $now->copy()->subWeek()->endOfWeek()),
            'lastMonth' => $calc($now->copy()->subMonth()->startOfMonth(), $now->copy()->subMonth()->endOfMonth()),
            'custom'    => null,
            'customFrom' => $customFrom,
            'customTo'   => $customTo,
        ];

        if ($customFrom && $customTo) {
            try {
                $from = Carbon::parse($customFrom)->startOfDay();
                $to   = Carbon::parse($customTo)->endOfDay();
                $result['custom'] = $calc($from, $to);
            } catch (\Exception $e) {
                // invalid dates — leave null
            }
        }

        return $result;
    }
}
