import { Head, router } from '@inertiajs/react';
import { Save, Upload, X, Image as ImageIcon } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';
import type { SiteContentGrouped, SiteContentItem } from '@/types/site-content';

const sectionLabels: Record<string, string> = {
    hero: 'Hero Section',
    features: 'Features Section',
    feature_1: 'Feature 1',
    feature_2: 'Feature 2',
    feature_3: 'Feature 3',
    about: 'About Section',
    cta: 'Call to Action',
    footer: 'Footer',
};

const keyLabels: Record<string, string> = {
    title: 'Title',
    subtitle: 'Subtitle',
    description: 'Description',
    button_text: 'Button Text',
    button_link: 'Button Link',
    image: 'Image',
    icon: 'Icon Name',
    copyright: 'Copyright Text',
};

export default function SiteContentIndex({ contents }: { contents: SiteContentGrouped }) {
    const [values, setValues] = useState<Record<number, string>>(() => {
        const initial: Record<number, string> = {};
        Object.values(contents).flat().forEach((item) => {
            initial[item.id] = item.value ?? '';
        });
        return initial;
    });
    const [files, setFiles] = useState<Record<number, File>>({});
    const [previews, setPreviews] = useState<Record<number, string>>({});
    const [processing, setProcessing] = useState(false);
    const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

    const handleValueChange = (id: number, value: string) => {
        setValues((prev) => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (id: number, file: File | null) => {
        if (file) {
            setFiles((prev) => ({ ...prev, [id]: file }));
            setPreviews((prev) => ({ ...prev, [id]: URL.createObjectURL(file) }));
        }
    };

    const removeImage = (id: number) => {
        setFiles((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
        setPreviews((prev) => {
            const next = { ...prev };
            if (next[id]) {
                URL.revokeObjectURL(next[id]);
                delete next[id];
            }
            return next;
        });
        if (fileInputRefs.current[id]) {
            fileInputRefs.current[id]!.value = '';
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        const allItems = Object.values(contents).flat();

        allItems.forEach((item, index) => {
            formData.append(`items[${index}][id]`, String(item.id));
            formData.append(`items[${index}][value]`, values[item.id] ?? '');
        });

        Object.entries(files).forEach(([id, file]) => {
            formData.append(`files[${id}]`, file);
        });

        router.post('/admin/site-content', formData, {
            forceFormData: true,
            onFinish: () => setProcessing(false),
        });
    };

    const getImageSrc = (item: SiteContentItem): string | null => {
        if (previews[item.id]) return previews[item.id];
        if (item.value) return `/storage/${item.value}`;
        return null;
    };

    const sections = Object.keys(contents);

    return (
        <>
            <Head title="Edit Home Page" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Edit Home Page</h2>
                    <p className="text-muted-foreground">Manage all text, images, and icons on the public home page.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {sections.map((section) => (
                        <div key={section} className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                            <h3 className="mb-4 text-lg font-semibold">{sectionLabels[section] ?? section}</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                {contents[section].map((item) => (
                                    <div key={item.id} className={item.type === 'textarea' ? 'md:col-span-2' : ''}>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                                            {keyLabels[item.key] ?? item.key}
                                        </label>

                                        {item.type === 'text' || item.type === 'icon' ? (
                                            <input
                                                type="text"
                                                value={values[item.id] ?? ''}
                                                onChange={(e) => handleValueChange(item.id, e.target.value)}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                            />
                                        ) : item.type === 'textarea' ? (
                                            <textarea
                                                value={values[item.id] ?? ''}
                                                onChange={(e) => handleValueChange(item.id, e.target.value)}
                                                rows={3}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                            />
                                        ) : item.type === 'image' ? (
                                            <div className="space-y-2">
                                                {getImageSrc(item) ? (
                                                    <div className="relative inline-block">
                                                        <img
                                                            src={getImageSrc(item)!}
                                                            alt={item.key}
                                                            className="h-32 w-auto rounded-md border object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(item.id)}
                                                            className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white shadow"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => fileInputRefs.current[item.id]?.click()}
                                                        className="flex h-32 w-48 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 hover:border-primary/50"
                                                    >
                                                        <div className="text-center">
                                                            <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/50" />
                                                            <p className="mt-1 text-xs text-muted-foreground">Click to upload</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <input
                                                    ref={(el) => { fileInputRefs.current[item.id] = el; }}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(item.id, e.target.files?.[0] ?? null)}
                                                    className="hidden"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRefs.current[item.id]?.click()}
                                                    className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80"
                                                >
                                                    <Upload className="h-3 w-3" />
                                                    {getImageSrc(item) ? 'Replace' : 'Upload'}
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {processing ? 'Saving...' : 'Save All Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
