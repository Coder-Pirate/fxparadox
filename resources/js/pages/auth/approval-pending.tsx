import { Head, Link, router } from '@inertiajs/react';
import { Clock, LogOut } from 'lucide-react';

export default function ApprovalPending() {
    function handleLogout(e: React.MouseEvent) {
        e.preventDefault();
        router.post('/logout');
    }

    return (
        <>
            <Head title="Account Pending Approval" />
            <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
                <div className="w-full max-w-md">
                    <div className="flex flex-col items-center gap-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold tracking-tight">Account Pending Approval</h1>
                            <p className="text-muted-foreground">
                                Your account has been created successfully, but it needs to be approved by an administrator before you can access the application.
                            </p>
                        </div>

                        <div className="w-full rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    <span>Account created</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
                                    <span>Waiting for admin approval</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                                    <span className="text-muted-foreground">Access granted</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            You will be able to access the application once an administrator approves your account. Please check back later.
                        </p>

                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

ApprovalPending.layout = null;
