import { Head } from '@inertiajs/react';
import TemplerForm from '@/components/templer-form';

export default function CreateTempler() {
    return (
        <>
            <Head title="New Template" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <TemplerForm submitUrl="/user/templers" />
            </div>
        </>
    );
}

CreateTempler.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/user/dashboard' },
        { title: 'Templers', href: '/user/templers' },
        { title: 'New Template', href: '/user/templers/create' },
    ],
};
