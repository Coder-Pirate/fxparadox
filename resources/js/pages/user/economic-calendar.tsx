import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Filter, RefreshCw } from 'lucide-react';
import { router } from '@inertiajs/react';

type NewsEvent = {
    title: string;
    country: string;
    date: string;
    impact: 'High' | 'Medium' | 'Low' | 'Holiday';
    forecast: string | null;
    previous: string | null;
};

type Props = {
    events: NewsEvent[];
};

const IMPACT_CONFIG = {
    High:    { dot: 'bg-red-600',    row: 'bg-red-50/60 dark:bg-red-950/10',    text: 'text-red-700 dark:text-red-300',    label: 'text-red-600 dark:text-red-400' },
    Medium:  { dot: 'bg-orange-400', row: '',                                     text: 'text-foreground',                   label: 'text-orange-500' },
    Low:     { dot: 'bg-yellow-400', row: '',                                     text: 'text-foreground',                   label: 'text-yellow-600 dark:text-yellow-400' },
    Holiday: { dot: 'bg-zinc-400',   row: 'bg-muted/30',                          text: 'text-muted-foreground',             label: 'text-muted-foreground' },
};

function FolderIcon({ impact }: { impact: string }) {
    const fill =
        impact === 'High'
            ? 'fill-red-600'
            : impact === 'Medium'
              ? 'fill-orange-400'
              : impact === 'Low'
                ? 'fill-yellow-400'
                : 'fill-zinc-400';
    return (
        <svg viewBox="0 0 24 24" className={`h-4 w-4 shrink-0 ${fill}`}>
            <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z" />
        </svg>
    );
}

function groupByDay(events: NewsEvent[]) {
    const map = new Map<string, NewsEvent[]>();
    events.forEach((e) => {
        const key = new Date(e.date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(e);
    });
    return map;
}

export default function EconomicCalendar({ events }: Props) {
    const today = new Date();
    const todayDow = today.getDay(); // 0=Sun

    const [impactFilter, setImpactFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
    const [currencyFilter, setCurrencyFilter] = useState<string>('All');
    const [dayFilter, setDayFilter] = useState<number | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Derive unique currencies from events
    const currencies = useMemo(() => {
        const set = new Set(events.map((e) => e.country));
        return Array.from(set).sort();
    }, [events]);

    const filtered = useMemo(() => {
        return events.filter((e) => {
            if (impactFilter !== 'All' && e.impact !== impactFilter) return false;
            if (currencyFilter !== 'All' && e.country !== currencyFilter) return false;
            if (dayFilter !== null && new Date(e.date).getDay() !== dayFilter) return false;
            return true;
        });
    }, [events, impactFilter, currencyFilter, dayFilter]);

    const grouped = groupByDay(filtered);

    const handleRefresh = () => {
        setRefreshing(true);
        router.visit('/user/economic-calendar?refresh=1', {
            preserveScroll: true,
            onFinish: () => setRefreshing(false),
        });
    };

    return (
        <>
            <Head title="Economic Calendar" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <CalendarClock className="h-5 w-5 text-muted-foreground" />
                                <CardTitle className="text-lg">Economic Calendar</CardTitle>
                                <span className="text-xs text-muted-foreground">(This Week)</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {(['All', 'High', 'Medium', 'Low'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setImpactFilter(f)}
                                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                            impactFilter === f
                                                ? f === 'High'
                                                    ? 'border-red-600 bg-red-600 text-white'
                                                    : f === 'Medium'
                                                      ? 'border-orange-400 bg-orange-400 text-white'
                                                      : f === 'Low'
                                                        ? 'border-yellow-400 bg-yellow-400 text-black'
                                                        : 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border bg-background text-foreground hover:bg-muted'
                                        }`}
                                    >
                                        {f !== 'All' && (
                                            <span className={`inline-block h-2 w-2 rounded-full ${IMPACT_CONFIG[f]?.dot}`} />
                                        )}
                                        {f}
                                    </button>
                                ))}
                                <button
                                    onClick={handleRefresh}
                                    className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted transition-colors"
                                    title="Refresh"
                                >
                                    <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Filter bar */}
                        <div className="mt-3 flex flex-col gap-3 rounded-lg border bg-muted/30 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center">
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                Filters
                            </div>

                            {/* Currency select */}
                            <select
                                value={currencyFilter}
                                onChange={(e) => setCurrencyFilter(e.target.value)}
                                className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:w-auto"
                            >
                                <option value="All">Select currency...</option>
                                {currencies.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>

                            {/* Day-of-week filter */}
                            <div className="flex flex-wrap items-center gap-1">
                                {([1, 2, 3, 4, 5, 6, 0] as const).map((dow) => {
                                    const label = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow];
                                    const isToday = dow === todayDow;
                                    const isActive = dayFilter === dow;
                                    return (
                                        <button
                                            key={dow}
                                            onClick={() => setDayFilter(isActive ? null : dow)}
                                            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                                                isActive
                                                    ? 'bg-primary text-primary-foreground'
                                                    : isToday
                                                      ? 'bg-primary/20 text-primary hover:bg-primary/30'
                                                      : 'text-foreground hover:bg-muted'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Clear filters */}
                            {(currencyFilter !== 'All' || dayFilter !== null) && (
                                <button
                                    onClick={() => { setCurrencyFilter('All'); setDayFilter(null); }}
                                    className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline sm:ml-auto"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filtered.length === 0 && (
                            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                No events found.
                            </div>
                        )}

                        {filtered.length > 0 && (
                            <div className="space-y-6">
                                {Array.from(grouped.entries()).map(([day, dayEvents]) => (
                                    <div key={day}>
                                        {/* Day header */}
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {day}
                                            </span>
                                            {dayEvents.some((e) => e.impact === 'High') && (
                                                <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-700 dark:bg-red-950/40 dark:text-red-400">
                                                    High Impact
                                                </span>
                                            )}
                                        </div>

                                        <div className="overflow-x-auto rounded-lg border">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                                                        <th className="px-3 py-2 font-medium">Time</th>
                                                        <th className="px-3 py-2 font-medium">Ccy</th>
                                                        <th className="px-3 py-2 font-medium">Impact</th>
                                                        <th className="px-3 py-2 font-medium">Event</th>
                                                        <th className="px-3 py-2 text-right font-medium">Forecast</th>
                                                        <th className="px-3 py-2 text-right font-medium">Previous</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dayEvents.map((event, idx) => {
                                                        const cfg = IMPACT_CONFIG[event.impact] ?? IMPACT_CONFIG.Low;
                                                        const isPast = new Date(event.date) < new Date();
                                                        const time = new Date(event.date).toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        });

                                                        return (
                                                            <tr key={idx} className={`border-b last:border-0 transition-colors ${isPast ? 'opacity-40' : `hover:bg-muted/30 ${cfg.row}`}`}>
                                                                <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted-foreground">
                                                                    {time}
                                                                </td>
                                                                <td className="px-3 py-2.5">
                                                                    <Badge variant="outline" className="px-1.5 py-0 text-[11px] font-bold">
                                                                        {event.country}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-3 py-2.5">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <FolderIcon impact={event.impact} />
                                                                        <span className={`hidden sm:inline text-[10px] font-semibold uppercase ${cfg.label}`}>
                                                                            {event.impact}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className={`px-3 py-2.5 font-medium ${cfg.text}`}>
                                                                    {event.title}
                                                                </td>
                                                                <td className="px-3 py-2.5 text-right text-muted-foreground">
                                                                    {event.forecast ?? '—'}
                                                                </td>
                                                                <td className="px-3 py-2.5 text-right text-muted-foreground">
                                                                    {event.previous ?? '—'}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

EconomicCalendar.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/user/dashboard' },
        { title: 'Economic Calendar', href: '/user/economic-calendar' },
    ],
};
