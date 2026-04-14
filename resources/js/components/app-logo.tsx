import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name, siteLogo } = usePage().props;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sky-500 text-white">
                {siteLogo ? (
                    <img src={`/storage/${siteLogo}`} alt={name} className="size-5 object-contain" />
                ) : (
                    <AppLogoIcon className="size-5 fill-current" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {name}
                </span>
            </div>
        </>
    );
}
