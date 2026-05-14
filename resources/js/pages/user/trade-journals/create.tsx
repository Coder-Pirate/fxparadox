import { Head, Link } from '@inertiajs/react';
import TradeJournalForm from '@/components/trade-journal-form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Props = {
    pairs: string[];
    sessions: string[];
    accounts: { id: number; account_name: string; balance: number }[];
    checklistRules: string[];
    dailyLimit: number;
    todayCount: number;
};

export default function CreateTradeJournal({ pairs, sessions, accounts, checklistRules, dailyLimit, todayCount }: Props) {
    const limitReached = todayCount >= dailyLimit;

    return (
        <>
            <Head title="New Trade Entry" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <TradeJournalForm submitUrl="/user/trade-journals" pairs={pairs} sessions={sessions} accounts={accounts} checklistRules={checklistRules} />
            </div>

            <Dialog open={limitReached}>
                <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            Daily Limit Reached
                        </DialogTitle>
                        <DialogDescription className="pt-1 text-base">
                            You have reached your daily journal limit of{' '}
                            <span className="font-semibold text-foreground">{dailyLimit}</span> {dailyLimit === 1 ? 'entry' : 'entries'} for today.
                            <br /><br />
                            You can update your daily limit in{' '}
                            <Link href="/user/trading-settings" className="font-medium underline underline-offset-4">
                                Trading Settings
                            </Link>
                            .
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button asChild>
                            <Link href="/user/trade-journals">Back to Journals</Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
