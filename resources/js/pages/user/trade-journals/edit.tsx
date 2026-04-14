import { Head } from '@inertiajs/react';
import TradeJournalForm from '@/components/trade-journal-form';
import type { TradeJournal } from '@/types/trade-journal';

type Props = {
    journal: TradeJournal;
    pairs: string[];
    sessions: string[];
    accounts: { id: number; account_name: string; balance: number }[];
    checklistRules: string[];
};

export default function EditTradeJournal({ journal, pairs, sessions, accounts, checklistRules }: Props) {
    return (
        <>
            <Head title="Edit Trade Entry" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <TradeJournalForm
                    journal={journal}
                    submitUrl={`/user/trade-journals/${journal.id}`}
                    pairs={pairs}
                    sessions={sessions}
                    accounts={accounts}
                    checklistRules={checklistRules}
                />
            </div>
        </>
    );
}

EditTradeJournal.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/user/dashboard' },
        { title: 'Trade Journal', href: '/user/trade-journals' },
        { title: 'Edit Trade', href: '#' },
    ],
};
