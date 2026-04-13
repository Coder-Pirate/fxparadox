import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Pencil, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import type { Templer } from '@/types/templer';
import { useState } from 'react';

type Props = {
    templer: Templer;
};

export default function ShowTempler({ templer }: Props) {
    const [zoom, setZoom] = useState(1);

    return (
        <>
            <Head title={templer.title} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Link href="/user/templers">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <Link href={`/user/templers/${templer.id}/edit`}>
                        <Button size="sm">
                            <Pencil className="mr-1 h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">{templer.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Created {new Date(templer.created_at).toLocaleDateString('default', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {templer.image && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button type="button" className="cursor-pointer overflow-hidden rounded-lg">
                                        <img
                                            src={`/${templer.image}`}
                                            alt={templer.title}
                                            className="max-h-96 w-full rounded-lg object-contain"
                                        />
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="!fixed !inset-2 !translate-x-0 !translate-y-0 !top-2 !left-2 !w-[calc(100vw-1rem)] !h-[calc(100vh-1rem)] !max-w-none !max-h-none !rounded-lg !border-none !p-4 !gap-2">
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

                        {templer.strategy_note && (
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-muted-foreground">Strategy Note</h3>
                                <p className="whitespace-pre-wrap text-sm">{templer.strategy_note}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ShowTempler.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/user/dashboard' },
        { title: 'Templers', href: '/user/templers' },
        { title: 'View Template', href: '#' },
    ],
};
