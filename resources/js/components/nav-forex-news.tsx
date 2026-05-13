import { useEffect, useState } from 'react';
import { RefreshCw, CalendarClock } from 'lucide-react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from '@/components/ui/sidebar';

type NewsEvent = {
    title: string;
    country: string;
    date: string;
    impact: 'High' | 'Medium' | 'Low' | 'Holiday';
    forecast: string | null;
    previous: string | null;
    actual: string | null;
};

function ImpactDot({ impact }: { impact: string }) {
    const color =
        impact === 'High'
            ? 'bg-red-600'
            : impact === 'Medium'
              ? 'bg-orange-400'
              : 'bg-yellow-400';
    return <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${color}`} />;
}

function FolderIcon({ impact }: { impact: string }) {
    const fill =
        impact === 'High'
            ? 'fill-red-600'
            : impact === 'Medium'
              ? 'fill-orange-400'
              : 'fill-yellow-400';
    return (
        <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 shrink-0 ${fill}`}>
            <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z" />
        </svg>
    );
}

export function NavForexNews() {
    const [events, setEvents] = useState<NewsEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const res = await fetch('/user/forex-news');
            if (!res.ok) throw new Error();
            const data: NewsEvent[] = await res.json();
            setEvents(data.filter((e) => e.impact === 'High' || e.impact === 'Medium'));
        } catch {
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    // Group by day label
    const grouped = events.reduce<Record<string, NewsEvent[]>>((acc, e) => {
        const label = new Date(e.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
        (acc[label] ??= []).push(e);
        return acc;
    }, {});

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className="flex items-center justify-between pr-1">
                <span className="flex items-center gap-1.5">
                    <CalendarClock className="h-3.5 w-3.5" />
                    Economic Calendar
                </span>
                <button
                    onClick={fetchNews}
                    className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
                    title="Refresh"
                >
                    <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </SidebarGroupLabel>

            <SidebarGroupContent>
                {loading && (
                    <p className="px-2 py-3 text-xs text-sidebar-foreground/50">Loading…</p>
                )}
                {!loading && events.length === 0 && (
                    <p className="px-2 py-3 text-xs text-sidebar-foreground/50">No high/medium events this week.</p>
                )}
                {!loading && events.length > 0 && (
                    <div className="space-y-3 px-1">
                        {Object.entries(grouped).map(([day, dayEvents]) => (
                            <div key={day}>
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                                    {day}
                                </p>
                                <div className="space-y-1">
                                    {dayEvents.map((e, i) => {
                                        const time = new Date(e.date).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        });
                                        return (
                                            <div
                                                key={i}
                                                className={`flex items-start gap-2 rounded-md px-2 py-1.5 text-xs ${
                                                    e.impact === 'High'
                                                        ? 'bg-red-50 dark:bg-red-950/20'
                                                        : 'bg-sidebar-accent/40'
                                                }`}
                                            >
                                                <FolderIcon impact={e.impact} />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`font-bold ${e.impact === 'High' ? 'text-red-700 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                                            {e.country}
                                                        </span>
                                                        <span className="truncate text-sidebar-foreground/70">{e.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-sidebar-foreground/50">
                                                        <span>{time}</span>
                                                        {e.forecast && <span>F: {e.forecast}</span>}
                                                        {e.previous && <span>P: {e.previous}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
