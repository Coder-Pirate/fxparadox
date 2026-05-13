<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class ForexNewsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $events = Cache::remember('forex_news_weekly', 1800, function () {
            $response = Http::timeout(10)
                ->withHeaders(['Accept' => 'application/json'])
                ->get('https://nfs.faireconomy.media/ff_calendar_thisweek.json');

            if (! $response->successful()) {
                return [];
            }

            return $response->json() ?? [];
        });

        // Filter to the next 3 days worth of events
        $now = now();
        $cutoff = $now->copy()->addDays(3)->endOfDay();

        $filtered = collect($events)
            ->filter(function ($event) use ($now, $cutoff) {
                if (empty($event['date'])) {
                    return false;
                }
                $eventDate = \Illuminate\Support\Carbon::parse($event['date']);
                return $eventDate >= $now->copy()->startOfDay() && $eventDate <= $cutoff;
            })
            ->map(function ($event) {
                return [
                    'title'    => $event['title'] ?? '',
                    'country'  => $event['country'] ?? '',
                    'date'     => $event['date'] ?? '',
                    'impact'   => $event['impact'] ?? 'Low',
                    'forecast' => !empty($event['forecast']) ? $event['forecast'] : null,
                    'previous' => !empty($event['previous']) ? $event['previous'] : null,
                    'actual'   => !empty($event['actual'])   ? $event['actual']   : null,
                ];
            })
            ->values();

        return response()->json($filtered);
    }
}
