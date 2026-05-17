import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';

// Pip value per standard lot (1.0) in USD for common Exness pairs.
// For USD-quote pairs (EURUSD, GBPUSD, etc.): 1 pip = $10/lot
// For USD-base pairs (USDJPY, USDCHF, etc.): ~$10/lot (approximate)
// For XAU/USD (Gold): 1 pip = $0.10 move × 100oz = $10/lot
// For indices (US30, NAS100, etc.): $1/lot per point
const PIP_VALUES: Record<string, number> = {
    'EUR/USD': 10, 'GBP/USD': 10, 'AUD/USD': 10, 'NZD/USD': 10,
    'USD/JPY': 10, 'USD/CHF': 10, 'USD/CAD': 10, 'USD/SGD': 10,
    'EUR/GBP': 10, 'EUR/JPY': 10, 'EUR/AUD': 10, 'EUR/CAD': 10,
    'GBP/JPY': 10, 'GBP/AUD': 10, 'GBP/CAD': 10,
    'AUD/JPY': 10, 'AUD/CAD': 10, 'CAD/JPY': 10,
    'XAU/USD': 10,
    'US30': 1,
    'NAS100': 1,
    'GER40': 1,
    'UK100': 1,
};

const DEFAULT_PAIRS = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD',
    'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'EUR/AUD',
    'GBP/AUD', 'EUR/CAD', 'GBP/CAD', 'XAU/USD', 'US30', 'NAS100',
];

const RISK_PRESETS = [0.5, 1, 1.5, 2, 2.5, 3, 5];

type Account = { id: number; account_name: string; balance: number };

type Props = {
    accounts: Account[];
    pairs: string[];
};

function getLotCategory(lots: number): { label: string; color: string } {
    if (lots < 0.01) return { label: 'Too small — increase risk or reduce SL', color: 'text-yellow-600' };
    if (lots <= 0.1)  return { label: 'Micro lot range', color: 'text-blue-600' };
    if (lots <= 1)    return { label: 'Mini to standard lot range', color: 'text-green-600' };
    return { label: 'Large position — double-check risk', color: 'text-red-600' };
}

export default function PositionCalculator({ accounts = [], pairs = [] }: Props) {
    const allPairs = pairs.length > 0 ? pairs : DEFAULT_PAIRS;

    const [accountId, setAccountId] = useState(accounts[0]?.id.toString() ?? '');
    const [pair, setPair] = useState(allPairs[0] ?? 'EUR/USD');
    const [riskPct, setRiskPct] = useState<number>(1);
    const [customRisk, setCustomRisk] = useState('');
    const [isCustomRisk, setIsCustomRisk] = useState(false);
    const [stopLossPips, setStopLossPips] = useState('');

    const account = accounts.find((a) => a.id.toString() === accountId);
    const balance = account ? Number(account.balance) : 0;

    const effectiveRisk = isCustomRisk ? parseFloat(customRisk || '0') : riskPct;
    const riskAmount = balance > 0 && effectiveRisk > 0 ? (balance * effectiveRisk) / 100 : 0;

    const pipValue = PIP_VALUES[pair] ?? 10;
    const slPips = parseFloat(stopLossPips || '0');

    const result = useMemo(() => {
        if (riskAmount <= 0 || slPips <= 0 || pipValue <= 0) return null;
        const lots = riskAmount / (slPips * pipValue);
        return {
            lots: lots,
            lotsDisplay: lots.toFixed(2),
            lotsRounded: (Math.floor(lots * 100) / 100).toFixed(2), // floor to 2dp (safe)
            riskAmount,
            pipValue,
            slPips,
            pipsToTP1: Math.round(slPips * 1),
            pipsToTP2: Math.round(slPips * 1.5),
            pipsToTP3: Math.round(slPips * 2),
            pipsToTP4: Math.round(slPips * 3),
            pipsToTP5: Math.round(slPips * 3.5),
            pipsToTP6: Math.round(slPips * 4),
            pipsToTP7: Math.round(slPips * 4.5),
            pipsToTP8: Math.round(slPips * 5),
            tp1Amount: riskAmount * 1,
            tp2Amount: riskAmount * 1.5,
            tp3Amount: riskAmount * 2,
            tp4Amount: riskAmount * 3,
            tp5Amount: riskAmount * 3.5,
            tp6Amount: riskAmount * 4,
            tp7Amount: riskAmount * 4.5,
            tp8Amount: riskAmount * 5,
        };
    }, [riskAmount, slPips, pipValue]);

    const lotCategory = result ? getLotCategory(result.lots) : null;

    return (
        <>
            <Head title="Position Calculator" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">

                <div className="flex items-center gap-3">
                    <Calculator className="h-6 w-6 text-muted-foreground" />
                    <div>
                        <h1 className="text-xl font-bold">Position Size Calculator</h1>
                        <p className="text-sm text-muted-foreground">Calculate your lot size based on risk and stop loss</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">

                    {/* Input Card */}
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base">Trade Parameters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">

                            {/* Account */}
                            {accounts.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Account</Label>
                                    <select
                                        value={accountId}
                                        onChange={(e) => setAccountId(e.target.value)}
                                        className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        {accounts.map((a) => (
                                            <option key={a.id} value={a.id.toString()}>
                                                {a.account_name} — ${Number(a.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </option>
                                        ))}
                                    </select>
                                    {account && (
                                        <p className="text-xs text-muted-foreground">
                                            Available balance: <span className="font-semibold text-foreground">${Number(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Currency Pair */}
                            <div className="space-y-2">
                                <Label>Currency Pair</Label>
                                <select
                                    value={pair}
                                    onChange={(e) => setPair(e.target.value)}
                                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {allPairs.map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-muted-foreground">
                                    Pip value: <span className="font-semibold text-foreground">${pipValue.toFixed(2)} per pip / standard lot</span>
                                </p>
                            </div>

                            {/* Risk % */}
                            <div className="space-y-2">
                                <Label>Risk per Trade</Label>
                                <div className="flex flex-wrap gap-2">
                                    {RISK_PRESETS.map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => { setRiskPct(r); setIsCustomRisk(false); setCustomRisk(''); }}
                                            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                                                !isCustomRisk && riskPct === r
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-border bg-background hover:bg-muted'
                                            }`}
                                        >
                                            {r}%
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setIsCustomRisk(true)}
                                        className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                                            isCustomRisk
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border bg-background hover:bg-muted'
                                        }`}
                                    >
                                        Custom
                                    </button>
                                </div>

                                {isCustomRisk && (
                                    <div className="flex items-center gap-2 pt-1">
                                        <Input
                                            type="number"
                                            step="0.1"
                                            min="0.1"
                                            max="100"
                                            placeholder="e.g. 2.5"
                                            value={customRisk}
                                            onChange={(e) => setCustomRisk(e.target.value)}
                                            className="h-9 w-32 text-sm"
                                            autoFocus
                                        />
                                        <span className="text-sm text-muted-foreground">%</span>
                                    </div>
                                )}

                                {balance > 0 && effectiveRisk > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        Risk amount: <span className="font-semibold text-foreground">${riskAmount.toFixed(2)}</span>
                                    </p>
                                )}
                            </div>

                            {/* Stop Loss Pips — single input */}
                            <div className="space-y-2">
                                <Label htmlFor="sl-pips">Stop Loss (pips)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="sl-pips"
                                        type="number"
                                        step="1"
                                        min="1"
                                        placeholder="e.g. 20"
                                        value={stopLossPips}
                                        onChange={(e) => setStopLossPips(e.target.value)}
                                        className="h-10 w-full text-base"
                                    />
                                    <span className="shrink-0 text-sm font-medium text-muted-foreground">pips</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    For JPY pairs, gold & indices — enter pips as displayed on Exness MT4/MT5.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Result Card */}
                    <div className="flex flex-col gap-4">

                        {/* Lot Size Result */}
                        <Card className={`border-2 ${result ? 'border-primary/30' : 'border-border'}`}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Lot Size Result</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!result ? (
                                    <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
                                        <Calculator className="h-10 w-10 opacity-20" />
                                        <p className="text-sm">Fill in all fields to calculate</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Main lot size */}
                                        <div className="rounded-xl bg-primary/5 px-6 py-5 text-center">
                                            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Lot Size</p>
                                            <p className="text-5xl font-bold tabular-nums tracking-tight">{result.lotsDisplay}</p>
                                            <p className="mt-1 text-sm text-muted-foreground">lots</p>
                                            {result.lotsRounded !== result.lotsDisplay && (
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    Safe floor: <span className="font-semibold">{result.lotsRounded} lots</span>
                                                </p>
                                            )}
                                        </div>

                                        {/* Category badge */}
                                        {lotCategory && (
                                            <p className={`text-center text-xs font-medium ${lotCategory.color}`}>
                                                {lotCategory.label}
                                            </p>
                                        )}

                                        {/* Summary row */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="rounded-lg bg-muted/40 p-3 text-center">
                                                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Risk $</p>
                                                <p className="mt-0.5 text-base font-bold text-red-600">${result.riskAmount.toFixed(2)}</p>
                                            </div>
                                            <div className="rounded-lg bg-muted/40 p-3 text-center">
                                                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">SL Pips</p>
                                                <p className="mt-0.5 text-base font-bold">{result.slPips}</p>
                                            </div>
                                            <div className="rounded-lg bg-muted/40 p-3 text-center">
                                                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Pip Value</p>
                                                <p className="mt-0.5 text-base font-bold">${result.pipValue}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Take Profit Targets */}
                        {result && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Take Profit Targets</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {[
                                            { rr: '1:1',   pips: result.pipsToTP1, amount: result.tp1Amount },
                                            { rr: '1:1.5', pips: result.pipsToTP2, amount: result.tp2Amount },
                                            { rr: '1:2',   pips: result.pipsToTP3, amount: result.tp3Amount },
                                            { rr: '1:3',   pips: result.pipsToTP4, amount: result.tp4Amount },
                                            { rr: '1:3.5', pips: result.pipsToTP5, amount: result.tp5Amount },
                                            { rr: '1:4',   pips: result.pipsToTP6, amount: result.tp6Amount },
                                            { rr: '1:4.5', pips: result.pipsToTP7, amount: result.tp7Amount },
                                            { rr: '1:5',   pips: result.pipsToTP8, amount: result.tp8Amount },
                                        ].map(({ rr, pips, amount }) => (
                                            <div key={rr} className="flex items-center justify-between rounded-lg border px-4 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                                    <span className="text-sm font-medium">R:R {rr}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-bold text-green-600">+${amount.toFixed(2)}</span>
                                                    <span className="ml-2 text-xs text-muted-foreground">{pips} pips</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Info box */}
                        <div className="flex gap-2 rounded-lg border bg-muted/30 p-3">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Pip values are set to <strong>$10/pip per standard lot</strong> for all forex pairs on Exness (standard accounts).
                                For US indices (US30, NAS100), pip value is <strong>$1/point per lot</strong>.
                                Always verify on your Exness trading terminal before placing a trade.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

PositionCalculator.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/user/dashboard' },
        { title: 'Position Calculator', href: '/user/position-calculator' },
    ],
};
