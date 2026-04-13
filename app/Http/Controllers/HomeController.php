<?php

namespace App\Http\Controllers;

use App\Models\SiteContent;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $contents = SiteContent::all()
            ->groupBy('section')
            ->map(fn ($items) => $items->mapWithKeys(fn ($item) => [$item->key => $item->value]))
            ->toArray();

        return Inertia::render('home', [
            'contents' => $contents,
            'canRegister' => Features::enabled(Features::registration()),
        ]);
    }
}
