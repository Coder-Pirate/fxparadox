<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\TradingSession;
use Illuminate\Http\Request;

class TradingSessionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
        ]);

        $request->user()->tradingSessions()->create($validated);

        return back()->with('success', 'Session added.');
    }

    public function update(Request $request, TradingSession $tradingSession)
    {
        if ($tradingSession->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
        ]);

        $tradingSession->update($validated);

        return back()->with('success', 'Session updated.');
    }

    public function destroy(Request $request, TradingSession $tradingSession)
    {
        if ($tradingSession->user_id !== $request->user()->id) {
            abort(403);
        }

        $tradingSession->delete();

        return back()->with('success', 'Session deleted.');
    }
}
