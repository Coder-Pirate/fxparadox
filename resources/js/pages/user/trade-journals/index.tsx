import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Image, Eye, ZoomIn, ZoomOut, RotateCcw, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import type { TradeJournal, PaginatedData } from '@/types/trade-journal';

type Filters = {
    search?: string;
    pair?: string;
    session?: string;
    result?: string;
    direction?: string;
    date_from?: string;
    date_to?: string;
    perPage?: string;
};

type Props = {
    journals: PaginatedData<TradeJournal>;
    filters: Filters;
    availablePairs: string[];
    availableSessions: string[];
};

const perPageOptions = [10, 15, 25, 50, 100];

export default function TradeJournalIndex({ journals, filters, availablePairs, availableSessions }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [pair, setPair] = useState(filters.pair || '');
    const [session, setSession] = useState(filters.session || '');
    const [result, setResult] = useState(filters.result || '');
    const [direction, setDirection] = useState(filters.direction || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [perPage, setPerPage] = useState(filters.perPage || '15');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const filtersKey = JSON.stringify(filters);
    useEffect(() => {
        setSearch(filters.search || '');
        setPair(filters.pair || '');
        setSession(filters.session || '');
        setResult(filters.result || '');
        setDirection(filters.direction || '');
        setDateFrom(filters.date_from || '');
        setDateTo(filters.date_to || '');
        setPerPage(filters.perPage || '15');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtersKey]);

    const fetchJournals = useCallback(
        (params: Record<string, string>) => {
            const cleanParams: Record<string, string> = {};
            for (const [key, value] of Object.entries(params)) {
                if (value !== '') {
                    cleanParams[key] = value;
                }
            }
            router.get('/user/trade-journals', cleanParams, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [],
    );

    useEffect(() => {
        if (search === (filters.search || '')) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchJournals({ search, pair, session, result, direction, date_from: dateFrom, date_to: dateTo, perPage });
        }, 300);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const applyFilters = (overrides: Partial<Record<string, string>>) => {
        fetchJournals({
            search, pair, session, result, direction, date_from: dateFrom, date_to: dateTo, perPage,
            ...overrides,
        });
    };

    const clearFilters = () => {
        setSearch(''); setPair(''); setSession(''); setResult(''); setDirection(''); setDateFrom(''); setDateTo(''); setPerPage('15');
        router.get('/user/trade-journals', {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const hasFilters = search || pair || session || result || direction || dateFrom || dateTo;

    const [deleteId, setDeleteId] = useState<number | null>(null);

    function confirmDelete() {
        if (deleteId) {
            router.delete(`/user/trade-journals/${deleteId}`, {
                onFinish: () => setDeleteId(null),
            });
        }
    }

    return (
        <>
            <Head title="Trade Journal" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Trade Journal</CardTitle>
                        <Link href="/user/trade-journals/create">
                            <Button size="sm">
                                <Plus className="mr-1 h-4 w-4" />
                                New Trade
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Filters */}
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
                            <div className="relative col-span-2">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search pair, comments, notes..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                            <select
                                value={pair}
                                onChange={(e) => { setPair(e.target.value); applyFilters({ pair: e.target.value }); }}
                                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">All Pairs</option>
                                {availablePairs.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            <select
                                value={session}
                                onChange={(e) => { setSession(e.target.value); applyFilters({ session: e.target.value }); }}
                                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">All Sessions</option>
                                {availableSessions.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            <select
                                value={result}
                                onChange={(e) => { setResult(e.target.value); applyFilters({ result: e.target.value }); }}
                                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">All Results</option>
                                <option value="profit">Profit</option>
                                <option value="loss">Loss</option>
                            </select>
                            <select
                                value={direction}
                                onChange={(e) => { setDirection(e.target.value); applyFilters({ direction: e.target.value }); }}
                                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">All Directions</option>
                                <option value="long">Long</option>
                                <option value="short">Short</option>
                            </select>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => { setDateFrom(e.target.value); applyFilters({ date_from: e.target.value }); }}
                                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="From"
                                title="Date from"
                            />
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => { setDateTo(e.target.value); applyFilters({ date_to: e.target.value }); }}
                                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="To"
                                title="Date to"
                            />
                            <select
                                value={perPage}
                                onChange={(e) => { setPerPage(e.target.value); applyFilters({ perPage: e.target.value }); }}
                                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                {perPageOptions.map((n) => (
                                    <option key={n} value={String(n)}>{n} per page</option>
                                ))}
                            </select>
                            {hasFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-1 rounded-lg border border-input px-3 py-2 text-sm hover:bg-accent"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Results info */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                                {journals.total > 0
                                    ? `Showing ${journals.from}–${journals.to} of ${journals.total} trades`
                                    : 'No trades found'}
                            </span>
                        </div>
                        {journals.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                {hasFilters ? 'No trades match your filters.' : 'No trades recorded yet. Click "New Trade" to get started.'}
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Day</TableHead>
                                            <TableHead>Account</TableHead>
                                            <TableHead>Pair</TableHead>
                                            <TableHead>Session</TableHead>
                                            <TableHead>HFT Trend</TableHead>
                                            <TableHead>MFT Trend</TableHead>
                                            <TableHead>Direction</TableHead>
                                            <TableHead>RR</TableHead>
                                            <TableHead>Lot Size</TableHead>
                                            <TableHead>Result</TableHead>
                                            <TableHead>P/L ($)</TableHead>
                                            <TableHead>Images</TableHead>
                                            <TableHead>Red News</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {journals.data.map((journal) => (
                                            <TableRow key={journal.id} className={journal.result === 'profit' ? 'bg-green-50 dark:bg-green-950/30' : journal.result === 'loss' ? 'bg-red-50 dark:bg-red-950/30' : ''}>
                                                <TableCell>{journal.trade_date.split('T')[0]}</TableCell>
                                                <TableCell>{journal.day}</TableCell>
                                                <TableCell>{journal.account_balance?.account_name ?? '-'}</TableCell>
                                                <TableCell className="font-medium">
                                                    <Link href={`/user/trade-journals/${journal.id}`} className="hover:underline">
                                                        {journal.pair}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{journal.session}</TableCell>
                                                <TableCell>{journal.hft_market_trend}</TableCell>
                                                <TableCell>{journal.mft_market_trend}</TableCell>
                                                <TableCell>
                                                    {journal.direction ? (
                                                        <Badge variant="default">
                                                            {journal.direction.toUpperCase()}
                                                        </Badge>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell>{journal.risk_reward}</TableCell>
                                                <TableCell>{journal.lot_size}</TableCell>
                                                <TableCell>
                                                    {journal.result ? (
                                                        <Badge className={journal.result === 'profit' ? 'bg-green-600 hover:bg-green-700 text-white' : ''} variant={journal.result === 'profit' ? 'default' : 'destructive'}>
                                                            {journal.result.toUpperCase()}
                                                        </Badge>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell className={journal.result === 'profit' ? 'text-green-600 dark:text-green-400 font-semibold' : journal.result === 'loss' ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
                                                    {journal.profit_loss_amount != null
                                                        ? `${journal.result === 'profit' ? '+' : '-'}$${Math.abs(Number(journal.profit_loss_amount)).toFixed(2)}`
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {journal.hft_entry_image && (
                                                            <ImagePreview src={`/${journal.hft_entry_image}`} label="HFT" />
                                                        )}
                                                        {journal.mft_entry_image && (
                                                            <ImagePreview src={`/${journal.mft_entry_image}`} label="MFT" />
                                                        )}
                                                        {journal.lft_entry_image && (
                                                            <ImagePreview src={`/${journal.lft_entry_image}`} label="LFT" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs">{journal.red_news_time ?? '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Link href={`/user/trade-journals/${journal.id}`}>
                                                            <Button variant="ghost" size="icon">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/user/trade-journals/${journal.id}/edit`}>
                                                            <Button variant="ghost" size="icon">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(journal.id)}>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {journals.last_page > 1 && (
                                    <div className="mt-4 flex items-center justify-center gap-1">
                                        {journals.links.map((link, i) => (
                                            <Link
                                                key={i}
                                                href={link.url ?? '#'}
                                                preserveScroll
                                                className={`rounded px-3 py-1 text-sm ${
                                                    link.active
                                                        ? 'bg-primary text-primary-foreground'
                                                        : link.url
                                                          ? 'hover:bg-muted'
                                                          : 'text-muted-foreground cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogTitle>
                        Are you sure you want to delete this trade entry?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Once deleted, this trade journal entry and its associated images will be permanently removed. This action cannot be undone.
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>
                            Delete trade
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function ImagePreview({ src, label }: { src: string; label: string }) {
    const [zoom, setZoom] = useState(1);

    function handleZoomIn() {
        setZoom((z) => Math.min(z + 0.25, 5));
    }
    function handleZoomOut() {
        setZoom((z) => Math.max(z - 0.25, 0.5));
    }
    function handleReset() {
        setZoom(1);
    }

    return (
        <Dialog onOpenChange={() => setZoom(1)}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="flex h-7 items-center gap-0.5 rounded border px-1.5 text-xs hover:bg-muted"
                    title={`View ${label} image`}
                >
                    <Image className="h-3 w-3" />
                    {label}
                </button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined} className="!fixed !inset-2 !translate-x-0 !translate-y-0 !top-2 !left-2 !w-[calc(100vw-1rem)] !h-[calc(100vh-1rem)] !max-w-none !max-h-none !rounded-lg !border-none !p-4 !gap-2 flex flex-col">
                <DialogTitle className="sr-only">{label} Entry</DialogTitle>
                <div className="flex items-center justify-between pb-2 pr-8">
                    <span className="text-sm font-medium">{label} Entry</span>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={handleZoomOut} className="rounded p-1.5 hover:bg-muted" title="Zoom out">
                            <ZoomOut className="h-4 w-4" />
                        </button>
                        <span className="text-xs text-muted-foreground min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
                        <button type="button" onClick={handleZoomIn} className="rounded p-1.5 hover:bg-muted" title="Zoom in">
                            <ZoomIn className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={handleReset} className="rounded p-1.5 hover:bg-muted" title="Reset zoom">
                            <RotateCcw className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <div className="overflow-auto flex-1">
                    <img
                        src={src}
                        alt={`${label} entry`}
                        className="rounded transition-transform duration-200 w-full h-full object-contain"
                        style={{ transform: `scale(${zoom})`, transformOrigin: zoom > 1 ? 'top left' : 'center' }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}

TradeJournalIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/user/dashboard' },
        { title: 'Trade Journal', href: '/user/trade-journals' },
    ],
};
