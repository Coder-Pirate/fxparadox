import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Eye, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import type { Templer } from '@/types/templer';
import { useState } from 'react';

type Props = {
    templers: Templer[];
};

export default function TemplersIndex({ templers = [] }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this template?')) {
            router.delete(`/user/templers/${id}`);
        }
    };

    return (
        <>
            <Head title="Templers" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Templers</h1>
                    <Link href="/user/templers/create">
                        <Button size="sm">
                            <Plus className="mr-1 h-4 w-4" />
                            New Template
                        </Button>
                    </Link>
                </div>

                {templers.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No templates yet. Click "New Template" to create your first strategy template.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {templers.map((templer) => (
                            <TemplerCard key={templer.id} templer={templer} onDelete={handleDelete} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function TemplerCard({ templer, onDelete }: { templer: Templer; onDelete: (id: number) => void }) {
    const [zoom, setZoom] = useState(1);

    return (
        <Card className="overflow-hidden">
            {templer.image && (
                <Dialog>
                    <DialogTrigger asChild>
                        <button type="button" className="w-full cursor-pointer overflow-hidden">
                            <img
                                src={`/${templer.image}`}
                                alt={templer.title}
                                className="h-48 w-full object-cover transition-transform hover:scale-105"
                            />
                        </button>
                    </DialogTrigger>
                    <DialogContent aria-describedby={undefined} className="!fixed !inset-2 !translate-x-0 !translate-y-0 !top-2 !left-2 !w-[calc(100vw-1rem)] !h-[calc(100vh-1rem)] !max-w-none !max-h-none !rounded-lg !border-none !p-4 !gap-2">
                        <DialogTitle className="sr-only">{templer.title}</DialogTitle>
                        <div className="flex items-center gap-2 pr-8">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}>
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}>
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(1)}>
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-auto flex items-center justify-center">
                            <img
                                src={`/${templer.image}`}
                                alt={templer.title}
                                className="transition-transform duration-200"
                                style={{ transform: `scale(${zoom})` }}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
            <CardHeader className="pb-2">
                <CardTitle className="text-base">{templer.title}</CardTitle>
            </CardHeader>
            <CardContent>
                {templer.strategy_note && (
                    <p className="mb-3 text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                        {templer.strategy_note}
                    </p>
                )}
                <div className="flex items-center gap-1">
                    <Link href={`/user/templers/${templer.id}`}>
                        <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href={`/user/templers/${templer.id}/edit`}>
                        <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(templer.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

TemplersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/user/dashboard' },
        { title: 'Templers', href: '/user/templers' },
    ],
};
