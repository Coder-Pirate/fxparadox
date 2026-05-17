<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DefaultRiskController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'default_risk_pct' => ['required', 'numeric', 'min:0.1', 'max:100'],
        ]);

        $request->user()->update($validated);

        return back()->with('success', 'Default risk percentage updated.');
    }
}
