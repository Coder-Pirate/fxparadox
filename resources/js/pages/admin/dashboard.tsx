import { Head, Link, usePage } from '@inertiajs/react';
import { Ban, Clock, Shield, Users, UserCheck } from 'lucide-react';

type Stats = {
    totalUsers: number;
    totalAdmins: number;
    totalManagers: number;
    totalRegularUsers: number;
    pendingApproval: number;
    inactiveUsers: number;
};

export default function AdminDashboard() {
    const { stats } = usePage<{ stats: Stats }>().props;

    const cards = [
        { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600 dark:text-blue-400', href: '/admin/users' },
        { title: 'Admins', value: stats.totalAdmins, icon: Shield, color: 'text-red-600 dark:text-red-400', href: '/admin/users?role=admin' },
        { title: 'Managers', value: stats.totalManagers, icon: UserCheck, color: 'text-amber-600 dark:text-amber-400', href: '/admin/users?role=manager' },
        { title: 'Users', value: stats.totalRegularUsers, icon: Users, color: 'text-green-600 dark:text-green-400', href: '/admin/users?role=user' },
        { title: 'Pending Approval', value: stats.pendingApproval, icon: Clock, color: 'text-orange-600 dark:text-orange-400', href: '/admin/users?approved=0' },
        { title: 'Inactive Users', value: stats.inactiveUsers, icon: Ban, color: 'text-gray-600 dark:text-gray-400', href: '/admin/users?active=0' },
    ];

    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
                    <p className="text-muted-foreground">Overview of your application.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {cards.map((card) => (
                        <Link
                            key={card.title}
                            href={card.href}
                            className="rounded-xl border border-sidebar-border/70 bg-card p-6 transition-colors hover:bg-accent/50 dark:border-sidebar-border"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                                <card.icon className={`h-5 w-5 ${card.color}`} />
                            </div>
                            <p className="mt-2 text-3xl font-bold">{card.value}</p>
                        </Link>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <h3 className="text-lg font-semibold">Quick Actions</h3>
                        <div className="mt-4 space-y-2">
                            <a
                                href="/admin/users"
                                className="flex items-center gap-2 rounded-lg p-3 text-sm hover:bg-accent"
                            >
                                <Users className="h-4 w-4" />
                                Manage Users
                            </a>
                            <a
                                href="/admin/users/create"
                                className="flex items-center gap-2 rounded-lg p-3 text-sm hover:bg-accent"
                            >
                                <UserCheck className="h-4 w-4" />
                                Create New User
                            </a>
                        </div>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <h3 className="text-lg font-semibold">System Info</h3>
                        <div className="mt-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Accounts</span>
                                <span className="font-medium">{stats.totalUsers}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Admin Accounts</span>
                                <span className="font-medium">{stats.totalAdmins}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Manager Accounts</span>
                                <span className="font-medium">{stats.totalManagers}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">User Accounts</span>
                                <span className="font-medium">{stats.totalRegularUsers}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Admin Dashboard',
            href: '/admin/dashboard',
        },
    ],
};
