<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model
{
    protected $fillable = [
        'section',
        'key',
        'type',
        'value',
        'order',
    ];

    public static function getSection(string $section): array
    {
        return static::where('section', $section)
            ->orderBy('order')
            ->get()
            ->mapWithKeys(fn ($item) => [$item->key => $item->value])
            ->toArray();
    }

    public static function getAllGrouped(): array
    {
        return static::orderBy('section')
            ->orderBy('order')
            ->get()
            ->groupBy('section')
            ->toArray();
    }

    public static function getValue(string $section, string $key, string $default = ''): string
    {
        return static::where('section', $section)
            ->where('key', $key)
            ->value('value') ?? $default;
    }
}
