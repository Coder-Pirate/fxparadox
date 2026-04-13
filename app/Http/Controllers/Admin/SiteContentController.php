<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SiteContentController extends Controller
{
    public function index(): Response
    {
        $contents = SiteContent::orderBy('section')->orderBy('order')->get();

        $grouped = $contents->groupBy('section')->map(function ($items) {
            return $items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'section' => $item->section,
                    'key' => $item->key,
                    'type' => $item->type,
                    'value' => $item->value,
                    'order' => $item->order,
                ];
            })->values()->toArray();
        })->toArray();

        return Inertia::render('admin/site-content/index', [
            'contents' => $grouped,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $items = $request->input('items', []);

        foreach ($items as $item) {
            $content = SiteContent::find($item['id']);
            if (! $content) {
                continue;
            }

            if ($content->type === 'image') {
                if ($request->hasFile("files.{$content->id}")) {
                    $file = $request->file("files.{$content->id}");
                    $request->validate([
                        "files.{$content->id}" => ['image', 'max:2048'],
                    ]);

                    // Delete old image
                    if ($content->value && Storage::disk('public')->exists($content->value)) {
                        Storage::disk('public')->delete($content->value);
                    }

                    $path = $file->store('site-content', 'public');
                    $content->update(['value' => $path]);
                }
            } else {
                $content->update(['value' => $item['value'] ?? '']);
            }
        }

        return back()->with('success', 'Site content updated successfully.');
    }
}
