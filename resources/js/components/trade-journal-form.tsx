import { useForm } from '@inertiajs/react';
import { FormEvent, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import type { TradeJournal } from '@/types/trade-journal';

const DEFAULT_PAIRS = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD',
    'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'EUR/AUD',
    'GBP/AUD', 'EUR/CAD', 'GBP/CAD', 'XAU/USD', 'US30', 'NAS100',
];

const DEFAULT_SESSIONS = ['Asian', 'London', 'New York', 'London/NY Overlap'];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const TRENDS = ['Bullish', 'Bearish', 'Ranging', 'Consolidation'];

type TradeJournalFormData = {
    _method?: string;
    account_balance_id: string;
    trade_date: string;
    day: string;
    pair: string;
    session: string;
    hft_market_trend: string;
    mft_market_trend: string;
    direction: string;
    risk_reward: string;
    lot_size: string;
    result: string;
    profit_loss_amount: string;
    trade_comment: string;
    hft_entry_image: File | null;
    mft_entry_image: File | null;
    lft_entry_image: File | null;
    red_news_time: string;
};

type Props = {
    journal?: TradeJournal;
    submitUrl: string;
    method?: 'post';
    pairs?: string[];
    sessions?: string[];
    accounts?: { id: number; account_name: string; balance: number }[];
};

export default function TradeJournalForm({ journal, submitUrl, pairs, sessions, accounts }: Props) {
    const CURRENCY_PAIRS = pairs && pairs.length > 0 ? pairs : DEFAULT_PAIRS;
    const SESSIONS_LIST = sessions && sessions.length > 0 ? sessions : DEFAULT_SESSIONS;
    const hftImageRef = useRef<HTMLInputElement>(null);
    const mftImageRef = useRef<HTMLInputElement>(null);
    const lftImageRef = useRef<HTMLInputElement>(null);

    const [previews, setPreviews] = useState<{ hft: string | null; mft: string | null; lft: string | null }>({
        hft: null,
        mft: null,
        lft: null,
    });

    function handleImageChange(field: 'hft_entry_image' | 'mft_entry_image' | 'lft_entry_image', file: File | null) {
        setData(field, file);
        const key = field.replace('_entry_image', '') as 'hft' | 'mft' | 'lft';
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviews((prev) => ({ ...prev, [key]: url }));
        } else {
            setPreviews((prev) => ({ ...prev, [key]: null }));
        }
    }

    const { data, setData, post, processing, errors } = useForm<TradeJournalFormData>({
        ...(journal ? { _method: 'PUT' } : {}),
        account_balance_id: journal?.account_balance_id?.toString() ?? '',
        trade_date: journal?.trade_date?.split('T')[0] ?? '',
        day: journal?.day ?? '',
        pair: journal?.pair ?? '',
        session: journal?.session ?? '',
        hft_market_trend: journal?.hft_market_trend ?? '',
        mft_market_trend: journal?.mft_market_trend ?? '',
        direction: journal?.direction ?? '',
        risk_reward: journal?.risk_reward ?? '',
        lot_size: journal?.lot_size?.toString() ?? '',
        result: journal?.result ?? '',
        profit_loss_amount: journal?.profit_loss_amount?.toString() ?? '',
        trade_comment: journal?.trade_comment ?? '',
        hft_entry_image: null,
        mft_entry_image: null,
        lft_entry_image: null,
        red_news_time: journal?.red_news_time ?? '',
    });

    function handleDateChange(value: string) {
        setData('trade_date', value);
        if (value) {
            const date = new Date(value);
            const dayName = DAYS[date.getDay() - 1];
            if (dayName) {
                setData((prev) => ({ ...prev, trade_date: value, day: dayName }));
            }
        }
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(submitUrl, { forceFormData: true });
    }

    return (
        <form onSubmit={handleSubmit} encType="multipart/form-data">
            <Card>
                <CardHeader>
                    <CardTitle>{journal ? 'Edit Trade' : 'New Trade Entry'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Account Select */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="account_balance_id">Account <span className="text-red-500">*</span></Label>
                            <Select value={data.account_balance_id} onValueChange={(v) => setData('account_balance_id', v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts && accounts.map((a) => (
                                        <SelectItem key={a.id} value={a.id.toString()}>
                                            {a.account_name} (${Number(a.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.account_balance_id} />
                        </div>
                    </div>

                    {/* Row 1: Date, Day, Pair, Session */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <Label htmlFor="trade_date">Trade Date</Label>
                            <Input
                                id="trade_date"
                                type="date"
                                value={data.trade_date}
                                onChange={(e) => handleDateChange(e.target.value)}
                            />
                            <InputError message={errors.trade_date} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="day">Day</Label>
                            <Select value={data.day} onValueChange={(v) => setData('day', v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DAYS.map((d) => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.day} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pair">Pair</Label>
                            <Select value={data.pair} onValueChange={(v) => setData('pair', v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select pair" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CURRENCY_PAIRS.map((p) => (
                                        <SelectItem key={p} value={p}>{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.pair} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="session">Session</Label>
                            <Select value={data.session} onValueChange={(v) => setData('session', v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select session" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SESSIONS_LIST.map((s) => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.session} />
                        </div>
                    </div>

                    {/* Row 2: HFT Trend, MFT Trend, Direction */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="hft_market_trend">HFT Market Trend</Label>
                            <Select value={data.hft_market_trend} onValueChange={(v) => setData('hft_market_trend', v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select trend" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TRENDS.map((t) => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.hft_market_trend} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mft_market_trend">MFT Market Trend</Label>
                            <Select value={data.mft_market_trend} onValueChange={(v) => setData('mft_market_trend', v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select trend" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TRENDS.map((t) => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.mft_market_trend} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="direction">Direction</Label>
                            <Select value={data.direction} onValueChange={(v) => setData('direction', v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Long / Short" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="long">Long</SelectItem>
                                    <SelectItem value="short">Short</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.direction} />
                        </div>
                    </div>

                    {/* Row 3: Risk/Reward, Lot Size, Result, P/L Amount */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <Label htmlFor="risk_reward">Risk : Reward</Label>
                            <Input
                                id="risk_reward"
                                placeholder="e.g. 1:2"
                                value={data.risk_reward}
                                onChange={(e) => setData('risk_reward', e.target.value)}
                            />
                            <InputError message={errors.risk_reward} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lot_size">Lot Size</Label>
                            <Input
                                id="lot_size"
                                type="number"
                                step="0.01"
                                placeholder="e.g. 0.10"
                                value={data.lot_size}
                                onChange={(e) => setData('lot_size', e.target.value)}
                            />
                            <InputError message={errors.lot_size} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="result">Result</Label>
                            <Select value={data.result} onValueChange={(v) => setData('result', v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Profit / Loss" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="profit">Profit</SelectItem>
                                    <SelectItem value="loss">Loss</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.result} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profit_loss_amount">P/L Amount ($)</Label>
                            <Input
                                id="profit_loss_amount"
                                type="number"
                                step="0.01"
                                placeholder="e.g. 150.00"
                                value={data.profit_loss_amount}
                                onChange={(e) => setData('profit_loss_amount', e.target.value)}
                            />
                            <InputError message={errors.profit_loss_amount} />
                        </div>
                    </div>

                    {/* Row 4: Red News Time */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="red_news_time">Red News Time</Label>
                            <Input
                                id="red_news_time"
                                placeholder="e.g. 8:30 AM EST - NFP"
                                value={data.red_news_time}
                                onChange={(e) => setData('red_news_time', e.target.value)}
                            />
                            <InputError message={errors.red_news_time} />
                        </div>
                    </div>

                    {/* Row 5: Image Uploads */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="hft_entry_image">HFT Entry Image</Label>
                            <Input
                                id="hft_entry_image"
                                type="file"
                                accept="image/*"
                                ref={hftImageRef}
                                onChange={(e) => handleImageChange('hft_entry_image', e.target.files?.[0] ?? null)}
                            />
                            {(previews.hft || (journal?.hft_entry_image && !data.hft_entry_image)) && (
                                <img
                                    src={previews.hft ?? `/${journal!.hft_entry_image}`}
                                    alt="HFT preview"
                                    className="mt-1 h-32 w-full rounded border object-cover cursor-pointer"
                                    onClick={() => window.open(previews.hft ?? `/${journal!.hft_entry_image}`, '_blank')}
                                />
                            )}
                            <InputError message={errors.hft_entry_image} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mft_entry_image">MFT Entry Image</Label>
                            <Input
                                id="mft_entry_image"
                                type="file"
                                accept="image/*"
                                ref={mftImageRef}
                                onChange={(e) => handleImageChange('mft_entry_image', e.target.files?.[0] ?? null)}
                            />
                            {(previews.mft || (journal?.mft_entry_image && !data.mft_entry_image)) && (
                                <img
                                    src={previews.mft ?? `/${journal!.mft_entry_image}`}
                                    alt="MFT preview"
                                    className="mt-1 h-32 w-full rounded border object-cover cursor-pointer"
                                    onClick={() => window.open(previews.mft ?? `/${journal!.mft_entry_image}`, '_blank')}
                                />
                            )}
                            <InputError message={errors.mft_entry_image} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lft_entry_image">LFT Entry Image</Label>
                            <Input
                                id="lft_entry_image"
                                type="file"
                                accept="image/*"
                                ref={lftImageRef}
                                onChange={(e) => handleImageChange('lft_entry_image', e.target.files?.[0] ?? null)}
                            />
                            {(previews.lft || (journal?.lft_entry_image && !data.lft_entry_image)) && (
                                <img
                                    src={previews.lft ?? `/${journal!.lft_entry_image}`}
                                    alt="LFT preview"
                                    className="mt-1 h-32 w-full rounded border object-cover cursor-pointer"
                                    onClick={() => window.open(previews.lft ?? `/${journal!.lft_entry_image}`, '_blank')}
                                />
                            )}
                            <InputError message={errors.lft_entry_image} />
                        </div>
                    </div>

                    {/* Row 6: Trade Comment */}
                    <div className="space-y-2">
                        <Label htmlFor="trade_comment">Trade Comment</Label>
                        <Textarea
                            id="trade_comment"
                            rows={3}
                            placeholder="Comment on the trade setup, entry, exit..."
                            value={data.trade_comment}
                            onChange={(e) => setData('trade_comment', e.target.value)}
                        />
                        <InputError message={errors.trade_comment} />
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : journal ? 'Update Trade' : 'Save Trade'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
