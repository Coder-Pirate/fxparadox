<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PipValuesController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'pip_values'   => ['required', 'array'],
            'pip_values.*' => ['required', 'numeric', 'min:0.01', 'max:10000'],
        ]);

        $request->user()->update([
            'pip_values' => $validated['pip_values'],
        ]);

        return back()->with('success', 'Pip values updated.');
    }
}
