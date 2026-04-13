<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\TradingPair;
use Illuminate\Http\Request;

class TradingPairController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:30'],
        ]);

        $request->user()->tradingPairs()->create($validated);

        return back()->with('success', 'Pair added.');
    }

    public function update(Request $request, TradingPair $tradingPair)
    {
        if ($tradingPair->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:30'],
        ]);

        $tradingPair->update($validated);

        return back()->with('success', 'Pair updated.');
    }

    public function destroy(Request $request, TradingPair $tradingPair)
    {
        if ($tradingPair->user_id !== $request->user()->id) {
            abort(403);
        }

        $tradingPair->delete();

        return back()->with('success', 'Pair deleted.');
    }
}
