<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AccountBalance;
use Illuminate\Http\Request;

class AccountBalanceController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_name' => ['required', 'string', 'max:100'],
            'balance' => ['required', 'numeric', 'min:0'],
        ]);

        $request->user()->accountBalances()->create($validated);

        return back()->with('success', 'Account added.');
    }

    public function update(Request $request, AccountBalance $accountBalance)
    {
        if ($accountBalance->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'account_name' => ['required', 'string', 'max:100'],
            'balance' => ['required', 'numeric', 'min:0'],
        ]);

        $accountBalance->update($validated);

        return back()->with('success', 'Account updated.');
    }

    public function destroy(Request $request, AccountBalance $accountBalance)
    {
        if ($accountBalance->user_id !== $request->user()->id) {
            abort(403);
        }

        $accountBalance->delete();

        return back()->with('success', 'Account deleted.');
    }
}
