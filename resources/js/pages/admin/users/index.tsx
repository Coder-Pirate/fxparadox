import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, Edit, FileSpreadsheet, FileText, Plus, Power, PowerOff, Printer, Search, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useFlashToast } from '@/hooks/use-flash-toast';
import type { User } from '@/types/auth';

type PaginatedUsers = {
    data: User[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    users: PaginatedUsers;
    filters: { search?: string; role?: string; perPage?: string; approved?: string; active?: string };
    roles: string[];
};

const perPageOptions = [10, 15, 25, 50, 100];

export default function UsersIndex() {
    const { users, filters, roles } = usePage<Props>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const [approvedFilter, setApprovedFilter] = useState(filters.approved ?? '');
    const [activeFilter, setActiveFilter] = useState(filters.active ?? '');
    const [perPage, setPerPage] = useState(filters.perPage || '10');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

    useFlashToast();

    // Sync local state when server-side filters change (e.g. navigating from dashboard)
    const filtersKey = JSON.stringify(filters);
    useEffect(() => {
        setSearch(filters.search || '');
        setRoleFilter(filters.role || '');
        setApprovedFilter(filters.approved ?? '');
        setActiveFilter(filters.active ?? '');
        setPerPage(filters.perPage || '10');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtersKey]);

    const fetchUsers = useCallback(
        (params: Record<string, string>) => {
            // Only send non-empty params
            const cleanParams: Record<string, string> = {};
            for (const [key, value] of Object.entries(params)) {
                if (value !== '') {
                    cleanParams[key] = value;
                }
            }
            router.get('/admin/users', cleanParams, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [],
    );

    // Debounced search only — fires 300ms after typing stops
    useEffect(() => {
        // Don't fetch on initial mount
        if (search === (filters.search || '')) {
            return;
        }

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            fetchUsers({ search, role: roleFilter, perPage, approved: approvedFilter, active: activeFilter });
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    // Immediate fetch helper for dropdown changes
    const applyFilters = (overrides: Partial<{ role: string; approved: string; active: string; perPage: string }>) => {
        const next = {
            search,
            role: roleFilter,
            perPage,
            approved: approvedFilter,
            active: activeFilter,
            ...overrides,
        };
        fetchUsers(next);
    };

    function handleDelete(userId: number) {
        setDeleteUserId(userId);
    }

    function confirmDelete() {
        if (deleteUserId !== null) {
            router.delete(`/admin/users/${deleteUserId}`, {
                onFinish: () => setDeleteUserId(null),
            });
        }
    }

    const roleBadgeColors: Record<string, string> = {
        admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        manager: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        user: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    };

    const approvalBadgeColors: Record<string, string> = {
        approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    };

    function handleApprove(userId: number) {
        router.post(`/admin/users/${userId}/approve`, {}, { preserveScroll: true });
    }

    function handleReject(userId: number) {
        router.post(`/admin/users/${userId}/reject`, {}, { preserveScroll: true });
    }

    function handleActivate(userId: number) {
        router.post(`/admin/users/${userId}/activate`, {}, { preserveScroll: true });
    }

    function handleDeactivate(userId: number) {
        router.post(`/admin/users/${userId}/deactivate`, {}, { preserveScroll: true });
    }

    function buildExportUrl(type: 'excel' | 'pdf') {
        const params = new URLSearchParams();

        if (search) {
            params.set('search', search);
        }

        if (roleFilter) {
            params.set('role', roleFilter);
        }

        if (approvedFilter !== '') {
            params.set('approved', approvedFilter);
        }

        if (activeFilter !== '') {
            params.set('active', activeFilter);
        }

        const query = params.toString();

        return `/admin/users/export/${type}${query ? `?${query}` : ''}`;
    }

    function handlePrint() {
        const tableEl = document.getElementById('users-table');

        if (!tableEl) {
            return;
        }

        const printWindow = window.open('', '_blank');

        if (!printWindow) {
            return;
        }

        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Users Report</title>
                <style>
                    body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
                    h1 { font-size: 18px; margin-bottom: 5px; }
                    p { color: #666; margin-bottom: 15px; }
                    table { width: 100%; border-collapse: collapse; }
                    th { background: #f3f4f6; padding: 8px 10px; text-align: left; font-weight: 600; border-bottom: 2px solid #d1d5db; }
                    td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; }
                    .no-print { display: none; }
                    .print-actions { margin-bottom: 20px; padding: 12px 16px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; display: flex; align-items: center; gap: 12px; }
                    .print-actions button { padding: 8px 20px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; }
                    .btn-print { background: #2563eb; color: #fff; }
                    .btn-print:hover { background: #1d4ed8; }
                    .btn-save { background: #16a34a; color: #fff; }
                    .btn-save:hover { background: #15803d; }
                    .print-actions span { font-size: 13px; color: #334155; }
                    @media print { .print-actions { display: none !important; } }
                </style>
            </head>
            <body>
                <div class="print-actions">
                    <button class="btn-print" onclick="window.print()">🖨 Print</button>
                    <button class="btn-save" onclick="window.print()">💾 Save as PDF</button>
                    <span>Tip: In the print dialog, select <strong>"Save as PDF"</strong> as the destination if no printer is connected.</span>
                </div>
                <h1>Users Report</h1>
                <p>Generated on ${dateStr} — Total: ${users.total} users</p>
                ${tableEl.outerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    return (
        <>
            <Head title="Manage Users" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:gap-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Users</h2>
                        <p className="text-sm text-muted-foreground">Manage all user accounts.</p>
                    </div>
                    <Link
                        href="/admin/users/create"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto"
                    >
                        <Plus className="h-4 w-4" />
                        Add User
                    </Link>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
                    <div className="relative col-span-2">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); applyFilters({ role: e.target.value }); }}
                        className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">All Roles</option>
                        {roles.map((r) => (
                            <option key={r} value={r}>
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                            </option>
                        ))}
                    </select>
                    <select
                        value={approvedFilter}
                        onChange={(e) => { setApprovedFilter(e.target.value); applyFilters({ approved: e.target.value }); }}
                        className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">All Status</option>
                        <option value="1">Approved</option>
                        <option value="0">Pending</option>
                    </select>
                    <select
                        value={activeFilter}
                        onChange={(e) => { setActiveFilter(e.target.value); applyFilters({ active: e.target.value }); }}
                        className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">All Active</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                    <select
                        value={perPage}
                        onChange={(e) => { setPerPage(e.target.value); applyFilters({ perPage: e.target.value }); }}
                        className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        {perPageOptions.map((n) => (
                            <option key={n} value={String(n)}>
                                {n} per page
                            </option>
                        ))}
                    </select>

                    <div className="col-span-2 flex gap-2 sm:ml-auto">
                        <a
                            href={buildExportUrl('excel')}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-input px-3 py-2 text-sm font-medium hover:bg-accent sm:flex-none"
                        >
                            <FileSpreadsheet className="h-4 w-4 text-green-600" />
                            Excel
                        </a>
                        <a
                            href={buildExportUrl('pdf')}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-input px-3 py-2 text-sm font-medium hover:bg-accent sm:flex-none"
                        >
                            <FileText className="h-4 w-4 text-red-600" />
                            PDF
                        </a>
                        <button
                            onClick={handlePrint}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-input px-3 py-2 text-sm font-medium hover:bg-accent sm:flex-none"
                        >
                            <Printer className="h-4 w-4 text-blue-600" />
                            Print
                        </button>
                    </div>
                </div>

                {/* Table — horizontally scrollable on mobile */}
                <div className="overflow-x-auto rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <table id="users-table" className="w-full min-w-[700px] text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Name</th>
                                <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Email</th>
                                <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Role</th>
                                <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Status</th>
                                <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Created</th>
                                <th className="no-print sticky right-0 whitespace-nowrap bg-muted/50 px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.data.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/30">
                                    <td className="whitespace-nowrap px-4 py-3 font-medium">{user.name}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{user.email}</td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${roleBadgeColors[user.role] || ''}`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <div className="flex gap-1">
                                            {user.role === 'admin' ? (
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${approvalBadgeColors.approved}`}>
                                                    Approved
                                                </span>
                                            ) : (
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${user.is_approved ? approvalBadgeColors.approved : approvalBadgeColors.pending}`}>
                                                    {user.is_approved ? 'Approved' : 'Pending'}
                                                </span>
                                            )}
                                            {user.role !== 'admin' && (
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${user.is_active ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="no-print sticky right-0 whitespace-nowrap bg-background px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {user.role !== 'admin' && !user.is_approved && (
                                                <button
                                                    onClick={() => handleApprove(user.id)}
                                                    title="Approve"
                                                    className="inline-flex items-center rounded-md p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                            )}
                                            {user.role !== 'admin' && user.is_approved && (
                                                <button
                                                    onClick={() => handleReject(user.id)}
                                                    title="Revoke Approval"
                                                    className="inline-flex items-center rounded-md p-1.5 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                            {user.role !== 'admin' && user.is_active && (
                                                <button
                                                    onClick={() => handleDeactivate(user.id)}
                                                    title="Deactivate"
                                                    className="inline-flex items-center rounded-md p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900/30"
                                                >
                                                    <PowerOff className="h-4 w-4" />
                                                </button>
                                            )}
                                            {user.role !== 'admin' && !user.is_active && (
                                                <button
                                                    onClick={() => handleActivate(user.id)}
                                                    title="Activate"
                                                    className="inline-flex items-center rounded-md p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                                >
                                                    <Power className="h-4 w-4" />
                                                </button>
                                            )}
                                            <Link
                                                href={`/admin/users/${user.id}/edit`}
                                                className="inline-flex items-center rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="inline-flex items-center rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        {users.from && users.to
                            ? `Showing ${users.from} to ${users.to} of ${users.total} results`
                            : `${users.total} results`}
                    </p>

                    {users.last_page > 1 && (
                        <div className="flex flex-wrap justify-center gap-1">
                            {users.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`rounded-md px-3 py-1.5 text-sm ${
                                        link.active
                                            ? 'bg-primary text-primary-foreground'
                                            : link.url
                                              ? 'hover:bg-accent'
                                              : 'cursor-not-allowed opacity-50'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    preserveState
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <AlertDialog open={deleteUserId !== null} onOpenChange={(open) => !open && setDeleteUserId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this user? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        { title: 'Admin Dashboard', href: '/admin/dashboard' },
        { title: 'Users', href: '/admin/users' },
    ],
};
