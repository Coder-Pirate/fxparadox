import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Newspaper, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type NewsEvent = {
    title: string;
    country: string;
    date: string;
    impact: 'High' | 'Medium' | 'Low' | 'Holiday';
    forecast: string | null;
    previous: string | null;
    actual: string | null;
};

const IMPACT_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
    High:    { label: 'High',    color: 'bg-red-600 text-white',           dot: 'bg-red-600' },
    Medium:  { label: 'Medium',  color: 'bg-orange-400 text-white',        dot: 'bg-orange-400' },
    Low:     { label: 'Low',     color: 'bg-yellow-400 text-black',        dot: 'bg-yellow-400' },
    Holiday: { label: 'Holiday', color: 'bg-zinc-400 text-white dark:bg-zinc-600', dot: 'bg-zinc-400' },
};

function groupByDay(events: NewsEvent[]) {
    const map = new Map<string, NewsEvent[]>();
    events.forEach((e) => {
        const key = new Date(e.date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
        });
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(e);
    });
    return map;
}

function FolderIcon({ impact }: { impact: string }) {
    if (impact === 'High') {
        return (
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-red-600 shrink-0" aria-label="High Impact">
                <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z" />
            </svg>
        );
    }
    if (impact === 'Medium') {
        return (
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-orange-400 shrink-0" aria-label="Medium Impact">
                <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z" />
            </svg>
        );
    }
    if (impact === 'Low') {
        return (
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-yellow-400 shrink-0" aria-label="Low Impact">
                <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z" />
            </svg>
        );
    }
    return null;
}

export default function ForexNewsWidget() {
    const [events, setEvents] = useState<NewsEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

    const fetchNews = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/user/forex-news');
            if (!res.ok) throw new Error('Failed to fetch');
            const data: NewsEvent[] = await res.json();
            setEvents(data);
        } catch {
            setError('Unable to load economic calendar.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const filtered = filter === 'All' ? events : events.filter((e) => e.impact === filter);
    const grouped = groupByDay(filtered);

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Newspaper className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-lg">Economic Calendar</CardTitle>
                        <span className="text-xs text-muted-foreground">(Next 3 Days)</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {(['All', 'High', 'Medium', 'Low'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                    filter === f
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
                                    <span
                                        className={`inline-block h-2 w-2 rounded-full ${
                                            IMPACT_CONFIG[f]?.dot ?? 'bg-zinc-400'
                                        }`}
                                    />
                                )}
                                {f}
                            </button>
                        ))}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fetchNews} title="Refresh">
                            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                        Loading economic calendar…
                    </div>
                )}
                {!loading && error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
                        {error}
                    </div>
                )}
                {!loading && !error && filtered.length === 0 && (
                    <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                        No events found for the next 3 days.
                    </div>
                )}
                {!loading && !error && filtered.length > 0 && (
                    <div className="space-y-5">
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

                                {/* Events table */}
                                <div className="overflow-x-auto rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                                                <th className="px-3 py-2 font-medium">Time</th>
                                                <th className="px-3 py-2 font-medium">Ccy</th>
                                                <th className="px-3 py-2 font-medium">Impact</th>
                                                <th className="px-3 py-2 font-medium">Event</th>
                                                <th className="px-3 py-2 text-right font-medium">Actual</th>
                                                <th className="px-3 py-2 text-right font-medium">Forecast</th>
                                                <th className="px-3 py-2 text-right font-medium">Previous</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dayEvents.map((event, idx) => {
                                                const time = new Date(event.date).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                });
                                                const isHigh = event.impact === 'High';

                                                return (
                                                    <tr
                                                        key={idx}
                                                        className={`border-b last:border-0 transition-colors hover:bg-muted/30 ${
                                                            isHigh
                                                                ? 'bg-red-50/50 dark:bg-red-950/10'
                                                                : ''
                                                        }`}
                                                    >
                                                        <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted-foreground">
                                                            {time}
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <Badge variant="outline" className="text-[11px] font-bold px-1.5 py-0">
                                                                {event.country}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <FolderIcon impact={event.impact} />
                                                                <span
                                                                    className={`hidden sm:inline text-[10px] font-semibold uppercase ${
                                                                        isHigh
                                                                            ? 'text-red-600 dark:text-red-400'
                                                                            : event.impact === 'Medium'
                                                                            ? 'text-orange-500'
                                                                            : 'text-yellow-600 dark:text-yellow-400'
                                                                    }`}
                                                                >
                                                                    {event.impact}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <span
                                                                className={`font-medium ${
                                                                    isHigh
                                                                        ? 'text-red-700 dark:text-red-300'
                                                                        : 'text-foreground'
                                                                }`}
                                                            >
                                                                {event.title}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2.5 text-right">
                                                            {event.actual ? (
                                                                <span className="font-semibold text-foreground">
                                                                    {event.actual}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
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
    );
}
