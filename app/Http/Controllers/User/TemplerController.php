<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Templer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TemplerController extends Controller
{
    public function index(Request $request)
    {
        $templers = $request->user()->templers()->latest()->get();

        return Inertia::render('user/templers/index', [
            'templers' => $templers,
        ]);
    }

    public function create()
    {
        return Inertia::render('user/templers/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'strategy_note' => ['nullable', 'string', 'max:5000'],
            'image' => ['nullable', 'image', 'max:5120'],
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_templer_' . $file->hashName();
            $file->move(public_path('uploads/templers'), $filename);
            $validated['image'] = 'uploads/templers/' . $filename;
        }

        $validated['user_id'] = $request->user()->id;

        Templer::create($validated);

        return redirect()->route('user.templers.index')
            ->with('success', 'Template created successfully.');
    }

    public function show(Templer $templer)
    {
        if ($templer->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('user/templers/show', [
            'templer' => $templer,
        ]);
    }

    public function edit(Templer $templer)
    {
        if ($templer->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('user/templers/edit', [
            'templer' => $templer,
        ]);
    }

    public function update(Request $request, Templer $templer)
    {
        if ($templer->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'strategy_note' => ['nullable', 'string', 'max:5000'],
            'image' => ['nullable', 'image', 'max:5120'],
        ]);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($templer->image && file_exists(public_path($templer->image))) {
                unlink(public_path($templer->image));
            }
            $file = $request->file('image');
            $filename = time() . '_templer_' . $file->hashName();
            $file->move(public_path('uploads/templers'), $filename);
            $validated['image'] = 'uploads/templers/' . $filename;
        } else {
            unset($validated['image']);
        }

        $templer->update($validated);

        return redirect()->route('user.templers.index')
            ->with('success', 'Template updated successfully.');
    }

    public function destroy(Templer $templer)
    {
        if ($templer->user_id !== auth()->id()) {
            abort(403);
        }

        if ($templer->image && file_exists(public_path($templer->image))) {
            unlink(public_path($templer->image));
        }

        $templer->delete();

        return redirect()->route('user.templers.index')
            ->with('success', 'Template deleted successfully.');
    }
}
