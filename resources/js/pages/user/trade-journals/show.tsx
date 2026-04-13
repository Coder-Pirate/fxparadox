import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Pencil, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from '@/components/ui/dialog';
import type { TradeJournal } from '@/types/trade-journal';

type Props = {
    journal: TradeJournal;
};

export default function ShowTradeJournal({ journal }: Props) {
    return (
        <>
            <Head title={`Trade - ${journal.pair} ${journal.trade_date.split('T')[0]}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href="/user/trade-journals">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to Journal
                        </Button>
                    </Link>
                    <Link href={`/user/trade-journals/${journal.id}/edit`}>
                        <Button size="sm">
                            <Pencil className="mr-1 h-4 w-4" />
                            Edit Trade
                        </Button>
                    </Link>
                </div>

                {/* Trade Summary Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">
                                {journal.pair} — {journal.trade_date.split('T')[0]}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant={journal.direction === 'long' ? 'default' : 'secondary'}>
                                    {journal.direction.toUpperCase()}
                                </Badge>
                                {journal.result && (
                                    <Badge className={journal.result === 'profit' ? 'bg-green-600 hover:bg-green-700 text-white' : ''} variant={journal.result === 'profit' ? 'default' : 'destructive'}>
                                        {journal.result.toUpperCase()}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <DetailItem label="Account" value={journal.account_balance?.account_name ?? '-'} />
                            <DetailItem label="Day" value={journal.day} />
                            <DetailItem label="Session" value={journal.session} />
                            <DetailItem label="Red News Time" value={journal.red_news_time ?? '-'} />
                        </div>
                    </CardContent>
                </Card>

                {/* Market Analysis Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Market Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <DetailItem label="HFT Market Trend" value={journal.hft_market_trend} />
                            <DetailItem label="MFT Market Trend" value={journal.mft_market_trend} />
                            <DetailItem label="Direction" value={journal.direction.toUpperCase()} />
                            <DetailItem label="Risk : Reward" value={journal.risk_reward || '-'} />
                        </div>
                    </CardContent>
                </Card>

                {/* Trade Result Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Trade Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <DetailItem label="Lot Size" value={journal.lot_size ? String(journal.lot_size) : '-'} />
                            <DetailItem label="Result" value={journal.result ? journal.result.toUpperCase() : '-'} />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">P/L Amount</p>
                                {journal.profit_loss_amount != null ? (
                                    <p className={`text-lg font-bold ${journal.result === 'profit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {journal.result === 'profit' ? '+' : '-'}${Math.abs(Number(journal.profit_loss_amount)).toFixed(2)}
                                    </p>
                                ) : (
                                    <p className="text-lg">-</p>
                                )}
                            </div>
                            <DetailItem label="Account Balance" value={journal.account_balance ? `$${Number(journal.account_balance.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'} />
                        </div>
                    </CardContent>
                </Card>

                {/* Chart Images Card */}
                {(journal.hft_entry_image || journal.mft_entry_image || journal.lft_entry_image) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Chart Images</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {journal.hft_entry_image && (
                                    <ImageCard src={`/${journal.hft_entry_image}`} label="HFT Entry" />
                                )}
                                {journal.mft_entry_image && (
                                    <ImageCard src={`/${journal.mft_entry_image}`} label="MFT Entry" />
                                )}
                                {journal.lft_entry_image && (
                                    <ImageCard src={`/${journal.lft_entry_image}`} label="LFT Entry" />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Trade Comment Card */}
                {journal.trade_comment && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Trade Comment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-sm">{journal.trade_comment}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Timestamps */}
                <div className="text-xs text-muted-foreground">
                    Created: {new Date(journal.created_at).toLocaleString()} · Updated: {new Date(journal.updated_at).toLocaleString()}
                </div>
            </div>
        </>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold">{value}</p>
        </div>
    );
}

function ImageCard({ src, label }: { src: string; label: string }) {
    const [zoom, setZoom] = useState(1);

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <Dialog onOpenChange={() => setZoom(1)}>
                <DialogTrigger asChild>
                    <img
                        src={src}
                        alt={label}
                        className="h-48 w-full cursor-pointer rounded-lg border object-cover transition-opacity hover:opacity-80"
                    />
                </DialogTrigger>
                <DialogContent className="!fixed !inset-2 !translate-x-0 !translate-y-0 !top-2 !left-2 !w-[calc(100vw-1rem)] !h-[calc(100vh-1rem)] !max-w-none !max-h-none !rounded-lg !border-none !p-4 !gap-2 flex flex-col">
                    <div className="flex items-center justify-between pb-2 pr-8">
                        <span className="text-sm font-medium">{label}</span>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))} className="rounded p-1.5 hover:bg-muted" title="Zoom out">
                                <ZoomOut className="h-4 w-4" />
                            </button>
                            <span className="text-xs text-muted-foreground min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
                            <button type="button" onClick={() => setZoom((z) => Math.min(z + 0.25, 5))} className="rounded p-1.5 hover:bg-muted" title="Zoom in">
                                <ZoomIn className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => setZoom(1)} className="rounded p-1.5 hover:bg-muted" title="Reset zoom">
                                <RotateCcw className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <div className="overflow-auto flex-1">
                        <img
                            src={src}
                            alt={label}
                            className="rounded transition-transform duration-200 w-full h-full object-contain"
                            style={{ transform: `scale(${zoom})`, transformOrigin: zoom > 1 ? 'top left' : 'center' }}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

ShowTradeJournal.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/user/dashboard' },
        { title: 'Trade Journal', href: '/user/trade-journals' },
        { title: 'Trade Details', href: '#' },
    ],
};
