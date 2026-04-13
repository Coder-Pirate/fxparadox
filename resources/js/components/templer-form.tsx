import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImagePlus, X } from 'lucide-react';
import type { Templer } from '@/types/templer';
import { useRef, useState, type FormEvent } from 'react';

type Props = {
    submitUrl: string;
    templer?: Templer;
};

export default function TemplerForm({ submitUrl, templer }: Props) {
    const isEditing = !!templer;

    const { data, setData, post, processing, errors } = useForm<{
        title: string;
        strategy_note: string;
        image: File | null;
        _method?: string;
    }>({
        title: templer?.title || '',
        strategy_note: templer?.strategy_note || '',
        image: null,
        ...(isEditing ? { _method: 'PUT' } : {}),
    });

    const [imagePreview, setImagePreview] = useState<string | null>(
        templer?.image ? `/${templer.image}` : null,
    );

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(submitUrl, { forceFormData: true });
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>{isEditing ? 'Edit Template' : 'New Template'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="e.g. My Breakout Strategy"
                        />
                        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="strategy_note">Strategy Note</Label>
                        <Textarea
                            id="strategy_note"
                            value={data.strategy_note}
                            onChange={(e) => setData('strategy_note', e.target.value)}
                            rows={6}
                            placeholder="Describe your strategy, entry/exit rules, risk management..."
                        />
                        {errors.strategy_note && <p className="text-sm text-red-500">{errors.strategy_note}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Image</Label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        {imagePreview ? (
                            <div className="relative h-48 w-48">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="h-48 w-48 rounded-lg border object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImagePreview(null);
                                        setData('image', null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex h-48 w-48 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:text-foreground"
                            >
                                <ImagePlus className="h-8 w-8" />
                                <span className="text-xs">Upload Image</span>
                            </button>
                        )}
                        {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : isEditing ? 'Update Template' : 'Create Template'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
