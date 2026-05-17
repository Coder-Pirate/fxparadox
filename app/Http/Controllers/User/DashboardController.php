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

        // Advanced stats
        $profitFactor = $totalLoss > 0 ? round($totalProfit / $totalLoss, 2) : ($totalProfit > 0 ? 99.99 : 0);
        $avgWin = $winTrades > 0 ? round($totalProfit / $winTrades, 2) : 0;
        $avgLoss = $lossTrades > 0 ? round($totalLoss / $lossTrades, 2) : 0;
        $streaks = $this->calcStreaks($user);

        // Checklist compliance
        $checklistCompliance = $this->calcChecklistCompliance($user);

        // Equity curve
        $equityCurve = $this->calcEquityCurve($user);

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
            'advancedStats' => [
                'profitFactor' => $profitFactor,
                'avgWin' => (float) $avgWin,
                'avgLoss' => (float) $avgLoss,
                'maxWinStreak' => $streaks['maxWin'],
                'maxLossStreak' => $streaks['maxLoss'],
            ],
            'checklistCompliance' => $checklistCompliance,
            'equityCurve' => $equityCurve,
            'accounts' => $accounts,
            'pnlPeriods' => $pnlPeriods,
            'dailySummary' => $dailySummary,
            'currentMonth' => $month,
        ]);
    }

    private function calcStreaks($user): array
    {
        $trades = $user->tradeJournals()
            ->whereNotNull('result')
            ->orderBy('trade_date')
            ->orderBy('created_at')
            ->pluck('result')
            ->toArray();

        $maxWin = 0; $maxLoss = 0;
        $curWin = 0; $curLoss = 0;

        foreach ($trades as $result) {
            if ($result === 'profit') {
                $curWin++;
                $curLoss = 0;
                $maxWin = max($maxWin, $curWin);
            } else {
                $curLoss++;
                $curWin = 0;
                $maxLoss = max($maxLoss, $curLoss);
            }
        }

        return ['maxWin' => $maxWin, 'maxLoss' => $maxLoss];
    }

    private function calcChecklistCompliance($user): array
    {
        $totalRules = $user->checklistRules()->count();

        if ($totalRules === 0) {
            return ['score' => null, 'fullWinRate' => null, 'fullTrades' => 0, 'partialWinRate' => null, 'partialTrades' => 0];
        }

        $trades = $user->tradeJournals()
            ->whereNotNull('result')
            ->select('result', 'checklist')
            ->get();

        if ($trades->isEmpty()) {
            return ['score' => null, 'fullWinRate' => null, 'fullTrades' => 0, 'partialWinRate' => null, 'partialTrades' => 0];
        }

        $totalChecked = 0; $totalPossible = 0;
        $fullWins = 0; $fullTrades = 0;
        $partialWins = 0; $partialTrades = 0;

        foreach ($trades as $trade) {
            $checklist = is_array($trade->checklist) ? $trade->checklist : [];
            $checked = count($checklist);
            $totalChecked += $checked;
            $totalPossible += $totalRules;

            if ($checked >= $totalRules) {
                $fullTrades++;
                if ($trade->result === 'profit') $fullWins++;
            } else {
                $partialTrades++;
                if ($trade->result === 'profit') $partialWins++;
            }
        }

        return [
            'score' => $totalPossible > 0 ? round(($totalChecked / $totalPossible) * 100, 1) : 0,
            'fullWinRate' => $fullTrades > 0 ? round(($fullWins / $fullTrades) * 100, 1) : null,
            'fullTrades' => $fullTrades,
            'partialWinRate' => $partialTrades > 0 ? round(($partialWins / $partialTrades) * 100, 1) : null,
            'partialTrades' => $partialTrades,
        ];
    }

    private function calcEquityCurve($user): array
    {
        $accounts = $user->accountBalances()->get(['id', 'account_name', 'starting_balance']);
        $curves = [];

        foreach ($accounts as $account) {
            $trades = $user->tradeJournals()
                ->where('account_balance_id', $account->id)
                ->whereNotNull('profit_loss_amount')
                ->orderBy('trade_date')
                ->orderBy('created_at')
                ->select('trade_date', 'result', 'profit_loss_amount')
                ->get();

            $balance = (float) $account->starting_balance;
            $points = [['date' => null, 'balance' => $balance]];

            foreach ($trades as $trade) {
                $amount = $trade->result === 'loss'
                    ? -abs((float) $trade->profit_loss_amount)
                    : abs((float) $trade->profit_loss_amount);
                $balance = round($balance + $amount, 2);
                $points[] = ['date' => $trade->trade_date->format('Y-m-d'), 'balance' => $balance];
            }

            $curves[] = [
                'accountId' => $account->id,
                'accountName' => $account->account_name,
                'startingBalance' => (float) $account->starting_balance,
                'points' => $points,
            ];
        }

        return $curves;
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
