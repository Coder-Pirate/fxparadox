import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
    BarChart3,
    Calendar,
    Target,
    DollarSign,
    ChevronLeft,
    ChevronRight,
    ArrowRightLeft,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type DayTrade = {
    id: number;
    pair: string;
    direction: 'long' | 'short';
    result: 'profit' | 'loss' | null;
    profit_loss_amount: number;
    session: string;
};

type DaySummary = {
    date: string;
    total_trades: number;
    total_profit: number;
    total_loss: number;
    net: number;
    trades: DayTrade[];
};

type Account = {
    id: number;
    account_name: string;
    balance: number;
};

type Props = {
    stats: {
        totalTrades: number;
        winTrades: number;
        lossTrades: number;
        winRate: number;
        daysTraded: number;
        totalProfit: number;
        totalLoss: number;
        netPnl: number;
    };
    accounts: Account[];
    dailySummary: DaySummary[];
    currentMonth: string;
};

const defaultStats = { totalTrades: 0, winTrades: 0, lossTrades: 0, winRate: 0, daysTraded: 0, totalProfit: 0, totalLoss: 0, netPnl: 0 };

export default function UserDashboard({ stats: rawStats, accounts = [], dailySummary = [], currentMonth }: Props) {
    const stats = rawStats || defaultStats;
    const monthStr = currentMonth || new Date().toISOString().slice(0, 7);
    const [year, month] = monthStr.split('-').map(Number);
    const monthDate = new Date(year, month - 1, 1);
    const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month - 1;

    const [selectedDay, setSelectedDay] = useState<DaySummary | null>(null);

    // Build calendar grid
    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
        const daysInMonth = new Date(year, month, 0).getDate();

        const summaryMap = new Map<number, DaySummary>();
        dailySummary.forEach((d) => {
            const day = new Date(d.date).getDate();
            summaryMap.set(day, d);
        });

        const days: { day: number | null; summary: DaySummary | null }[] = [];

        // Leading blanks
        for (let i = 0; i < firstDay; i++) {
            days.push({ day: null, summary: null });
        }

        for (let d = 1; d <= daysInMonth; d++) {
            days.push({ day: d, summary: summaryMap.get(d) || null });
        }

        return days;
    }, [year, month, dailySummary]);

    const navigateMonth = (direction: 'prev' | 'next') => {
        const d = new Date(year, month - 1, 1);
        if (direction === 'prev') d.setMonth(d.getMonth() - 1);
        else d.setMonth(d.getMonth() + 1);
        const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        router.get('/user/dashboard', { month: m }, { preserveState: true, preserveScroll: true });
    };

    const goToday = () => {
        const m = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        router.get('/user/dashboard', { month: m }, { preserveState: true, preserveScroll: true });
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalTrades}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.winTrades} wins / {stats.lossTrades} losses
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.winRate}%</div>
                            <p className="text-xs text-muted-foreground">
                                Based on {stats.totalTrades} trade{stats.totalTrades !== 1 ? 's' : ''}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Days Traded</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.daysTraded}</div>
                            <p className="text-xs text-muted-foreground">Unique trading days</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net P&L</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${stats.netPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${Math.abs(stats.netPnl).toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600">${stats.totalProfit.toFixed(2)}</span>
                                {' / '}
                                <span className="text-red-600">-${stats.totalLoss.toFixed(2)}</span>
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Account Balances */}
                {accounts.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {accounts.map((account) => (
                            <Card key={account.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{account.account_name}</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">${Number(account.balance).toFixed(2)}</div>
                                    <p className="text-xs text-muted-foreground">Account Balance</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Daily Summary Calendar */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Daily Summary</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateMonth('prev')}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="min-w-[140px] text-center text-sm font-semibold">{monthName}</span>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateMonth('next')}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="ml-2 h-8" onClick={goToday}>
                                    <Calendar className="mr-1 h-3 w-3" />
                                    Today
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Day headers */}
                        <div className="grid grid-cols-7 text-center text-sm font-medium text-muted-foreground">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                                <div key={d} className="border-b py-2">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7">
                            {calendarDays.map((cell, i) => {
                                const isToday = isCurrentMonth && cell.day === today.getDate();
                                const hasProfit = cell.summary && cell.summary.net > 0;
                                const hasLoss = cell.summary && cell.summary.net < 0;

                                return (
                                    <div
                                        key={i}
                                        onClick={() => cell.summary && setSelectedDay(cell.summary)}
                                        className={`relative min-h-[100px] border-b border-r p-2 ${
                                            i % 7 === 0 ? 'border-l' : ''
                                        } ${cell.day === null ? 'bg-muted/30' : ''} ${
                                            hasProfit ? 'bg-green-50 dark:bg-green-950/30' : ''
                                        } ${hasLoss ? 'bg-red-50 dark:bg-red-950/30' : ''} ${
                                            cell.summary ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                                        }`}
                                    >
                                        {cell.day !== null && (
                                            <>
                                                <span
                                                    className={`text-sm ${
                                                        isToday
                                                            ? 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold'
                                                            : 'text-foreground'
                                                    } ${hasProfit ? 'text-green-700 dark:text-green-400' : ''} ${
                                                        hasLoss ? 'text-red-700 dark:text-red-400' : ''
                                                    }`}
                                                >
                                                    {cell.day}
                                                </span>

                                                {cell.summary && (
                                                    <div className="mt-4 flex flex-col items-center gap-0.5">
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <span>{cell.summary.total_trades}</span>
                                                            <ArrowRightLeft className="h-3 w-3" />
                                                        </div>
                                                        <span
                                                            className={`text-xs font-semibold ${
                                                                cell.summary.net >= 0
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : 'text-red-600 dark:text-red-400'
                                                            }`}
                                                        >
                                                            ${Math.abs(cell.summary.net).toFixed(2)}
                                                        </span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Day Detail Dialog */}
            <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            Trades on{' '}
                            {selectedDay &&
                                new Date(selectedDay.date + 'T00:00:00').toLocaleDateString('default', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedDay && (
                        <div className="space-y-3">
                            {/* Day summary bar */}
                            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                                <span>{selectedDay.total_trades} trade{selectedDay.total_trades !== 1 ? 's' : ''}</span>
                                <span
                                    className={`font-semibold ${
                                        selectedDay.net >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}
                                >
                                    {selectedDay.net >= 0 ? '+' : '-'}${Math.abs(selectedDay.net).toFixed(2)}
                                </span>
                            </div>

                            {/* Trade list */}
                            <div className="space-y-2">
                                {selectedDay.trades.map((trade) => (
                                    <Link
                                        key={trade.id}
                                        href={`/user/trade-journals/${trade.id}`}
                                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <div className="font-medium">{trade.pair}</div>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Badge variant={trade.direction === 'long' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                                                        {trade.direction?.toUpperCase()}
                                                    </Badge>
                                                    <span>{trade.session}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {trade.result && (
                                                <>
                                                    <Badge
                                                        variant={trade.result === 'profit' ? 'default' : 'destructive'}
                                                        className={trade.result === 'profit' ? 'bg-green-600' : ''}
                                                    >
                                                        {trade.result.toUpperCase()}
                                                    </Badge>
                                                    <div
                                                        className={`mt-0.5 text-sm font-semibold ${
                                                            trade.result === 'profit'
                                                                ? 'text-green-600'
                                                                : 'text-red-600'
                                                        }`}
                                                    >
                                                        {trade.result === 'profit' ? '+' : '-'}$
                                                        {Math.abs(trade.profit_loss_amount).toFixed(2)}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

UserDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/user/dashboard',
        },
    ],
};
