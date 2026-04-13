export type SiteContentItem = {
    id: number;
    section: string;
    key: string;
    type: 'text' | 'textarea' | 'image' | 'icon';
    value: string | null;
    order: number;
};

export type SiteContentGrouped = Record<string, SiteContentItem[]>;
export type SiteContentValues = Record<string, Record<string, string | null>>;
