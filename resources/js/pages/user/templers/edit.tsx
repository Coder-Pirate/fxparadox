import { Head } from '@inertiajs/react';
import TemplerForm from '@/components/templer-form';
import type { Templer } from '@/types/templer';

type Props = {
    templer: Templer;
};

export default function EditTempler({ templer }: Props) {
    return (
        <>
            <Head title="Edit Template" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <TemplerForm submitUrl={`/user/templers/${templer.id}`} templer={templer} />
            </div>
        </>
    );
}

EditTempler.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/user/dashboard' },
        { title: 'Templers', href: '/user/templers' },
        { title: 'Edit Template', href: '#' },
    ],
};
