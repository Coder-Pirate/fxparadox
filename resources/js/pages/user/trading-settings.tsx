import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Pencil, Trash2, Plus, Settings2, DollarSign, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { TradingPair, TradingSession, AccountBalance } from '@/types/trading-settings';

type Props = {
    pairs: TradingPair[];
    sessions: TradingSession[];
    accounts: AccountBalance[];
};

export default function TradingSettings({ pairs, sessions, accounts }: Props) {
    return (
        <>
            <Head title="Trading Settings" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <PairsSection pairs={pairs} />
                <SessionsSection sessions={sessions} />
                <AccountsSection accounts={accounts} />
            </div>
        </>
    );
}

/* ─── Trading Pairs ─── */
function PairsSection({ pairs }: { pairs: TradingPair[] }) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');

    const form = useForm({ name: '' });

    function handleAdd(e: FormEvent) {
        e.preventDefault();
        form.post('/user/trading-pairs', { preserveScroll: true, onSuccess: () => form.reset() });
    }

    function startEdit(pair: TradingPair) {
        setEditingId(pair.id);
        setEditName(pair.name);
    }

    function handleUpdate(id: number) {
        router.put(`/user/trading-pairs/${id}`, { name: editName }, { preserveScroll: true, onSuccess: () => setEditingId(null) });
    }

    function handleDelete(id: number) {
        if (confirm('Delete this pair?')) {
            router.delete(`/user/trading-pairs/${id}`, { preserveScroll: true });
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" /> Trading Pairs
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleAdd} className="flex items-end gap-2">
                    <div className="flex-1 space-y-1">
                        <Label htmlFor="new-pair">Add Pair</Label>
                        <Input
                            id="new-pair"
                            placeholder="e.g. EUR/USD"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                        />
                        <InputError message={form.errors.name} />
                    </div>
                    <Button type="submit" disabled={form.processing} size="sm">
                        <Plus className="mr-1 h-4 w-4" /> Add
                    </Button>
                </form>

                {pairs.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pair</TableHead>
                                <TableHead className="w-32 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pairs.map((pair) => (
                                <TableRow key={pair.id}>
                                    <TableCell>
                                        {editingId === pair.id ? (
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdate(pair.id)}
                                                className="h-8"
                                            />
                                        ) : (
                                            pair.name
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {editingId === pair.id ? (
                                            <div className="flex justify-end gap-1">
                                                <Button size="sm" variant="default" onClick={() => handleUpdate(pair.id)}>Save</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => startEdit(pair)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(pair.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

/* ─── Trading Sessions ─── */
function SessionsSection({ sessions }: { sessions: TradingSession[] }) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');

    const form = useForm({ name: '' });

    function handleAdd(e: FormEvent) {
        e.preventDefault();
        form.post('/user/trading-sessions', { preserveScroll: true, onSuccess: () => form.reset() });
    }

    function startEdit(session: TradingSession) {
        setEditingId(session.id);
        setEditName(session.name);
    }

    function handleUpdate(id: number) {
        router.put(`/user/trading-sessions/${id}`, { name: editName }, { preserveScroll: true, onSuccess: () => setEditingId(null) });
    }

    function handleDelete(id: number) {
        if (confirm('Delete this session?')) {
            router.delete(`/user/trading-sessions/${id}`, { preserveScroll: true });
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5" /> Trading Sessions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleAdd} className="flex items-end gap-2">
                    <div className="flex-1 space-y-1">
                        <Label htmlFor="new-session">Add Session</Label>
                        <Input
                            id="new-session"
                            placeholder="e.g. London"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                        />
                        <InputError message={form.errors.name} />
                    </div>
                    <Button type="submit" disabled={form.processing} size="sm">
                        <Plus className="mr-1 h-4 w-4" /> Add
                    </Button>
                </form>

                {sessions.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Session</TableHead>
                                <TableHead className="w-32 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sessions.map((session) => (
                                <TableRow key={session.id}>
                                    <TableCell>
                                        {editingId === session.id ? (
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdate(session.id)}
                                                className="h-8"
                                            />
                                        ) : (
                                            session.name
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {editingId === session.id ? (
                                            <div className="flex justify-end gap-1">
                                                <Button size="sm" variant="default" onClick={() => handleUpdate(session.id)}>Save</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => startEdit(session)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(session.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

/* ─── Account Balances ─── */
function AccountsSection({ accounts }: { accounts: AccountBalance[] }) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editAccountName, setEditAccountName] = useState('');
    const [editBalance, setEditBalance] = useState('');

    const form = useForm({ account_name: '', balance: '' });

    function handleAdd(e: FormEvent) {
        e.preventDefault();
        form.post('/user/account-balances', { preserveScroll: true, onSuccess: () => form.reset() });
    }

    function startEdit(account: AccountBalance) {
        setEditingId(account.id);
        setEditAccountName(account.account_name);
        setEditBalance(account.balance.toString());
    }

    function handleUpdate(id: number) {
        router.put(`/user/account-balances/${id}`, { account_name: editAccountName, balance: editBalance }, { preserveScroll: true, onSuccess: () => setEditingId(null) });
    }

    function handleDelete(id: number) {
        if (confirm('Delete this account?')) {
            router.delete(`/user/account-balances/${id}`, { preserveScroll: true });
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" /> Account Balances
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleAdd} className="flex items-end gap-2">
                    <div className="flex-1 space-y-1">
                        <Label htmlFor="new-account-name">Account Name</Label>
                        <Input
                            id="new-account-name"
                            placeholder="e.g. Main Account"
                            value={form.data.account_name}
                            onChange={(e) => form.setData('account_name', e.target.value)}
                        />
                        <InputError message={form.errors.account_name} />
                    </div>
                    <div className="w-40 space-y-1">
                        <Label htmlFor="new-balance">Balance ($)</Label>
                        <Input
                            id="new-balance"
                            type="number"
                            step="0.01"
                            placeholder="e.g. 10000"
                            value={form.data.balance}
                            onChange={(e) => form.setData('balance', e.target.value)}
                        />
                        <InputError message={form.errors.balance} />
                    </div>
                    <Button type="submit" disabled={form.processing} size="sm">
                        <Plus className="mr-1 h-4 w-4" /> Add
                    </Button>
                </form>

                {accounts.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Account</TableHead>
                                <TableHead>Balance</TableHead>
                                <TableHead className="w-32 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accounts.map((account) => (
                                <TableRow key={account.id}>
                                    <TableCell>
                                        {editingId === account.id ? (
                                            <Input
                                                value={editAccountName}
                                                onChange={(e) => setEditAccountName(e.target.value)}
                                                className="h-8"
                                            />
                                        ) : (
                                            account.account_name
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === account.id ? (
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={editBalance}
                                                onChange={(e) => setEditBalance(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdate(account.id)}
                                                className="h-8 w-32"
                                            />
                                        ) : (
                                            `$${Number(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {editingId === account.id ? (
                                            <div className="flex justify-end gap-1">
                                                <Button size="sm" variant="default" onClick={() => handleUpdate(account.id)}>Save</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => startEdit(account)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(account.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

TradingSettings.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/user/dashboard' },
        { title: 'Trading Settings', href: '/user/trading-settings' },
    ],
};
