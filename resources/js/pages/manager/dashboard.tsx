import { Head, usePage } from '@inertiajs/react';
import { Users, UserCheck } from 'lucide-react';

type Stats = {
    totalUsers: number;
    totalManagers: number;
};

export default function ManagerDashboard() {
    const { stats } = usePage<{ stats: Stats }>().props;

    const cards = [
        { title: 'Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600 dark:text-blue-400' },
        { title: 'Managers', value: stats.totalManagers, icon: UserCheck, color: 'text-amber-600 dark:text-amber-400' },
    ];

    return (
        <>
            <Head title="Manager Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Manager Dashboard</h2>
                    <p className="text-muted-foreground">Manage your team and resources.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {cards.map((card) => (
                        <div
                            key={card.title}
                            className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                                <card.icon className={`h-5 w-5 ${card.color}`} />
                            </div>
                            <p className="mt-2 text-3xl font-bold">{card.value}</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                    <h3 className="text-lg font-semibold">Manager Overview</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Welcome to your manager dashboard. Here you can oversee your team's activities and manage resources.
                    </p>
                </div>
            </div>
        </>
    );
}

ManagerDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Manager Dashboard',
            href: '/manager/dashboard',
        },
    ],
};
