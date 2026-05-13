<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class EconomicCalendarController extends Controller
{
    public function __invoke(Request $request)
    {
        // Allow forcing a fresh fetch by passing ?refresh=1
        if ($request->boolean('refresh')) {
            Cache::forget('forex_news_weekly');
        }

        $raw = Cache::remember('forex_news_weekly', 1800, function () {
            $response = Http::timeout(10)
                ->withHeaders(['Accept' => 'application/json'])
                ->get('https://nfs.faireconomy.media/ff_calendar_thisweek.json');

            if (! $response->successful()) {
                return [];
            }

            return $response->json() ?? [];
        });

        $events = collect($raw)->map(fn ($e) => [
            'title'    => $e['title'] ?? '',
            'country'  => $e['country'] ?? '',
            'date'     => $e['date'] ?? '',
            'impact'   => $e['impact'] ?? 'Low',
            'forecast' => !empty($e['forecast']) ? $e['forecast'] : null,
            'previous' => !empty($e['previous']) ? $e['previous'] : null,
        ])->values();

        return Inertia::render('user/economic-calendar', [
            'events' => $events,
        ]);
    }
}
