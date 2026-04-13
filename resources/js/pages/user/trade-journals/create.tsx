import { Head } from '@inertiajs/react';
import TradeJournalForm from '@/components/trade-journal-form';

type Props = {
    pairs: string[];
    sessions: string[];
    accounts: { id: number; account_name: string; balance: number }[];
};

export default function CreateTradeJournal({ pairs, sessions, accounts }: Props) {
    return (
        <>
            <Head title="New Trade Entry" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <TradeJournalForm submitUrl="/user/trade-journals" pairs={pairs} sessions={sessions} accounts={accounts} />
            </div>
        </>
    );
}

CreateTradeJournal.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/user/dashboard' },
        { title: 'Trade Journal', href: '/user/trade-journals' },
        { title: 'New Trade', href: '/user/trade-journals/create' },
    ],
};
