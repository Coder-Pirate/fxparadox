<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\ChecklistRule;
use Illuminate\Http\Request;

class ChecklistRuleController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
        ]);

        $maxOrder = $request->user()->checklistRules()->max('sort_order') ?? 0;
        $validated['sort_order'] = $maxOrder + 1;

        $request->user()->checklistRules()->create($validated);

        return back()->with('success', 'Checklist rule added.');
    }

    public function update(Request $request, ChecklistRule $checklistRule)
    {
        if ($checklistRule->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
        ]);

        $checklistRule->update($validated);

        return back()->with('success', 'Checklist rule updated.');
    }

    public function destroy(Request $request, ChecklistRule $checklistRule)
    {
        if ($checklistRule->user_id !== $request->user()->id) {
            abort(403);
        }

        $checklistRule->delete();

        return back()->with('success', 'Checklist rule deleted.');
    }
}
