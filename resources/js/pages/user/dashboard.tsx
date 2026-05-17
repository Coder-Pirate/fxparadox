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
    TrendingUp,
    TrendingDown,
    Award,
    AlertTriangle,
    CheckSquare,
    Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';

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

type PnlStat = { net: number; profit: number; loss: number; trades: number };

type PnlPeriods = {
    today: PnlStat;
    yesterday: PnlStat;
    lastWeek: PnlStat;
    lastMonth: PnlStat;
    custom: PnlStat | null;
    customFrom: string | null;
    customTo: string | null;
};

type Account = {
    id: number;
    account_name: string;
    balance: number;
    starting_balance: number;
};

type AdvancedStats = {
    profitFactor: number;
    avgWin: number;
    avgLoss: number;
    maxWinStreak: number;
    maxLossStreak: number;
};

type ChecklistCompliance = {
    score: number | null;
    fullWinRate: number | null;
    fullTrades: number;
    partialWinRate: number | null;
    partialTrades: number;
};

type EquityCurvePoint = { date: string | null; balance: number };
type EquityCurve = {
    accountId: number;
    accountName: string;
    startingBalance: number;
    points: EquityCurvePoint[];
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
    advancedStats: AdvancedStats;
    checklistCompliance: ChecklistCompliance;
    equityCurve: EquityCurve[];
    accounts: Account[];
    pnlPeriods: PnlPeriods;
    dailySummary: DaySummary[];
    currentMonth: string;
};

const defaultStats = { totalTrades: 0, winTrades: 0, lossTrades: 0, winRate: 0, daysTraded: 0, totalProfit: 0, totalLoss: 0, netPnl: 0 };
const defaultAdvancedStats: AdvancedStats = { profitFactor: 0, avgWin: 0, avgLoss: 0, maxWinStreak: 0, maxLossStreak: 0 };
const defaultCompliance: ChecklistCompliance = { score: null, fullWinRate: null, fullTrades: 0, partialWinRate: null, partialTrades: 0 };
const defaultPnlStat: PnlStat = { net: 0, profit: 0, loss: 0, trades: 0 };
const defaultPnlPeriods: PnlPeriods = { today: defaultPnlStat, yesterday: defaultPnlStat, lastWeek: defaultPnlStat, lastMonth: defaultPnlStat, custom: null, customFrom: null, customTo: null };

function PnlValue({ value }: { value: number }) {
    const pos = value >= 0;
    return (
        <span className={`text-2xl font-bold ${pos ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {pos ? '+' : '-'}${Math.abs(value).toFixed(2)}
        </span>
    );
}

function PnlSubtext({ stat }: { stat: PnlStat }) {
    return (
        <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+${stat.profit.toFixed(2)}</span>
            {' / '}
            <span className="text-red-600">-${stat.loss.toFixed(2)}</span>
            {' · '}
            {stat.trades} trade{stat.trades !== 1 ? 's' : ''}
        </p>
    );
}

function EquityCurveChart({ curve }: { curve: EquityCurve }) {
    const { points, startingBalance } = curve;
    if (points.length < 2) {
        return (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                Log trades to see your equity curve
            </div>
        );
    }

    const last = points[points.length - 1].balance;
    const isPositive = last >= startingBalance;
    const color = isPositive ? '#16a34a' : '#dc2626';

    const chartData = points.map((p, i) => ({
        index: i,
        balance: p.balance,
        date: p.date ?? 'Start',
    }));

    return (
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                />
                <YAxis
                    tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v.toLocaleString()}`}
                    width={70}
                />
                <Tooltip
                    formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Balance']}
                    labelFormatter={(label) => label === 'Start' ? 'Starting Balance' : `Date: ${label}`}
                    contentStyle={{ fontSize: 12 }}
                />
                <ReferenceLine y={startingBalance} stroke="#94a3b8" strokeDasharray="4 4" strokeOpacity={0.6} />
                <Line
                    type="monotone"
                    dataKey="balance"
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: color }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

export default function UserDashboard({ stats: rawStats, advancedStats: rawAdvanced, checklistCompliance: rawCompliance, equityCurve = [], accounts = [], pnlPeriods: rawPnl, dailySummary = [], currentMonth }: Props) {
    const stats = rawStats || defaultStats;
    const advanced = rawAdvanced || defaultAdvancedStats;
    const compliance = rawCompliance || defaultCompliance;
    const pnl = rawPnl || defaultPnlPeriods;
    const monthStr = currentMonth || new Date().toISOString().slice(0, 7);
    const [year, month] = monthStr.split('-').map(Number);
    const monthDate = new Date(year, month - 1, 1);
    const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month - 1;

    const [selectedDay, setSelectedDay] = useState<DaySummary | null>(null);
    const [customFrom, setCustomFrom] = useState(pnl.customFrom ?? '');
    const [customTo, setCustomTo] = useState(pnl.customTo ?? '');
    const [pnlTab, setPnlTab] = useState<'today' | 'yesterday' | 'lastWeek' | 'lastMonth' | 'custom'>(
        pnl.customFrom && pnl.customTo ? 'custom' : 'today'
    );
    const [selectedCurveAccount, setSelectedCurveAccount] = useState<number>(equityCurve[0]?.accountId ?? 0);

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

                {/* Advanced Stats Row */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${advanced.profitFactor >= 1.5 ? 'text-green-600' : advanced.profitFactor >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {advanced.profitFactor === 99.99 ? '∞' : advanced.profitFactor.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">Gross profit ÷ gross loss</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Win</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                ${advanced.avgWin.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">Per winning trade</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Loss</CardTitle>
                            <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                ${advanced.avgLoss.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">Per losing trade</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Win Streak</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{advanced.maxWinStreak}</div>
                            <p className="text-xs text-muted-foreground">Best consecutive wins</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Loss Streak</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{advanced.maxLossStreak}</div>
                            <p className="text-xs text-muted-foreground">Worst consecutive losses</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Account Balances + PnL Summary */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {accounts.map((account) => {
                        const gain = account.balance - account.starting_balance;
                        return (
                            <Card key={account.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{account.account_name}</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">${Number(account.balance).toFixed(2)}</div>
                                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Starting: ${Number(account.starting_balance).toFixed(2)}</span>
                                        <span className={gain >= 0 ? 'font-semibold text-green-600 dark:text-green-400' : 'font-semibold text-red-600 dark:text-red-400'}>
                                            {gain >= 0 ? '+' : '-'}${Math.abs(gain).toFixed(2)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {/* PnL Summary */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">P&L Summary</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {/* Tab buttons */}
                            <div className="mb-3 flex flex-wrap gap-1">
                                {([
                                    { key: 'today', label: 'Today' },
                                    { key: 'yesterday', label: 'Yesterday' },
                                    { key: 'lastWeek', label: 'Last Week' },
                                    { key: 'lastMonth', label: 'Last Month' },
                                    { key: 'custom', label: 'Custom' },
                                ] as { key: typeof pnlTab; label: string }[]).map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => setPnlTab(key)}
                                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
                                            pnlTab === key
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {pnlTab !== 'custom' && (() => {
                                const stat = pnl[pnlTab];
                                return (
                                    <div className="flex flex-col gap-0.5">
                                        <PnlValue value={stat.net} />
                                        <PnlSubtext stat={stat} />
                                    </div>
                                );
                            })()}

                            {pnlTab === 'custom' && (
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[11px] text-muted-foreground">From</span>
                                            <input
                                                type="date"
                                                value={customFrom}
                                                onChange={(e) => setCustomFrom(e.target.value)}
                                                className="h-7 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[11px] text-muted-foreground">To</span>
                                            <input
                                                type="date"
                                                value={customTo}
                                                onChange={(e) => setCustomTo(e.target.value)}
                                                className="h-7 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="h-7 flex-1 text-xs"
                                                onClick={() => {
                                                    if (customFrom && customTo) {
                                                        router.get('/user/dashboard', { pnl_from: customFrom, pnl_to: customTo }, { preserveScroll: true });
                                                    }
                                                }}
                                                disabled={!customFrom || !customTo}
                                            >
                                                Apply
                                            </Button>
                                            {pnl.customFrom && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs"
                                                    onClick={() => {
                                                        setCustomFrom('');
                                                        setCustomTo('');
                                                        setPnlTab('today');
                                                        router.get('/user/dashboard', {}, { preserveScroll: true });
                                                    }}
                                                >
                                                    Clear
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {pnl.custom && (
                                        <div className="flex flex-col gap-0.5">
                                            <PnlValue value={pnl.custom.net} />
                                            <PnlSubtext stat={pnl.custom} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Equity Curve + Checklist Compliance + Position Size */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Equity Curve */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="pb-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    <CardTitle className="text-sm font-medium">Equity Curve</CardTitle>
                                </div>
                                {equityCurve.length > 1 && (
                                    <div className="flex flex-wrap gap-1">
                                        {equityCurve.map((c) => (
                                            <button
                                                key={c.accountId}
                                                onClick={() => setSelectedCurveAccount(c.accountId)}
                                                className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
                                                    selectedCurveAccount === c.accountId
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                }`}
                                            >
                                                {c.accountName}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {equityCurve.length === 0 ? (
                                <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                                    Add an account and log trades to see your equity curve
                                </div>
                            ) : (
                                (() => {
                                    const curve = equityCurve.find((c) => c.accountId === selectedCurveAccount) ?? equityCurve[0];
                                    const last = curve.points[curve.points.length - 1]?.balance ?? curve.startingBalance;
                                    const change = last - curve.startingBalance;
                                    return (
                                        <>
                                            <div className="mb-3 flex items-baseline gap-3">
                                                <span className="text-2xl font-bold">${last.toFixed(2)}</span>
                                                <span className={`text-sm font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {change >= 0 ? '+' : '-'}${Math.abs(change).toFixed(2)}
                                                </span>
                                                <span className="text-xs text-muted-foreground">from ${curve.startingBalance.toFixed(2)}</span>
                                            </div>
                                            <EquityCurveChart curve={curve} />
                                        </>
                                    );
                                })()
                            )}
                        </CardContent>
                    </Card>

                    {/* Checklist Compliance */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                                <CardTitle className="text-sm font-medium">Checklist Compliance</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {compliance.score === null ? (
                                <p className="text-sm text-muted-foreground">
                                    Add checklist rules in Trading Settings to track compliance.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {/* Compliance score ring */}
                                    <div className="flex flex-col items-center gap-1 py-2">
                                        <span className={`text-4xl font-bold ${compliance.score >= 80 ? 'text-green-600' : compliance.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {compliance.score}%
                                        </span>
                                        <p className="text-xs text-muted-foreground">avg rules checked per trade</p>
                                    </div>
                                    {/* Win rate comparison */}
                                    <div className="space-y-2">
                                        {compliance.fullTrades > 0 && (
                                            <div className="flex items-center justify-between rounded-md bg-green-50 px-3 py-2 dark:bg-green-950/20">
                                                <div>
                                                    <p className="text-xs font-medium text-green-700 dark:text-green-400">Full compliance</p>
                                                    <p className="text-[10px] text-muted-foreground">{compliance.fullTrades} trade{compliance.fullTrades !== 1 ? 's' : ''}</p>
                                                </div>
                                                <span className="text-lg font-bold text-green-600">{compliance.fullWinRate ?? 0}%</span>
                                            </div>
                                        )}
                                        {compliance.partialTrades > 0 && (
                                            <div className="flex items-center justify-between rounded-md bg-red-50 px-3 py-2 dark:bg-red-950/20">
                                                <div>
                                                    <p className="text-xs font-medium text-red-700 dark:text-red-400">Partial compliance</p>
                                                    <p className="text-[10px] text-muted-foreground">{compliance.partialTrades} trade{compliance.partialTrades !== 1 ? 's' : ''}</p>
                                                </div>
                                                <span className="text-lg font-bold text-red-600">{compliance.partialWinRate ?? 0}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Daily Summary Calendar */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                        <div className="grid grid-cols-7 text-center text-xs sm:text-sm font-medium text-muted-foreground">
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
                                        className={`relative min-h-[60px] sm:min-h-[100px] border-b border-r p-1 sm:p-2 ${
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
                                                    className={`text-xs sm:text-sm ${
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
                                                    <div className="mt-2 sm:mt-4 flex flex-col items-center gap-0.5">
                                                        <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                                                            <span>{cell.summary.total_trades}</span>
                                                            <ArrowRightLeft className="h-3 w-3" />
                                                        </div>
                                                        <span
                                                            className={`text-[10px] sm:text-xs font-semibold ${
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
