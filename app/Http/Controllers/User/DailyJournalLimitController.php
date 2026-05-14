<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DailyJournalLimitController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'daily_journal_limit' => ['required', 'integer', 'min:1', 'max:50'],
        ]);

        $request->user()->update($validated);

        return back()->with('success', 'Daily journal limit updated.');
    }
}
