<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\TradeJournal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TradeJournalController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->tradeJournals()->with('accountBalance');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('pair', 'like', "%{$search}%")
                  ->orWhere('trade_comment', 'like', "%{$search}%")
                  ->orWhere('red_news_time', 'like', "%{$search}%");
            });
        }

        if ($pair = $request->input('pair')) {
            $query->where('pair', $pair);
        }

        if ($session = $request->input('session')) {
            $query->where('session', $session);
        }

        if ($result = $request->input('result')) {
            $query->where('result', $result);
        }

        if ($direction = $request->input('direction')) {
            $query->where('direction', $direction);
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('trade_date', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('trade_date', '<=', $dateTo);
        }

        $perPage = in_array((int) $request->input('perPage'), [10, 15, 25, 50, 100]) ? (int) $request->input('perPage') : 15;

        $journals = $query->orderByDesc('trade_date')->orderByDesc('created_at')->paginate($perPage)->withQueryString();

        return Inertia::render('user/trade-journals/index', [
            'journals' => $journals,
            'filters' => $request->only(['search', 'pair', 'session', 'result', 'direction', 'date_from', 'date_to', 'perPage']),
            'availablePairs' => $request->user()->tradeJournals()->distinct()->pluck('pair')->sort()->values(),
            'availableSessions' => $request->user()->tradeJournals()->distinct()->pluck('session')->sort()->values(),
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('user/trade-journals/create', [
            'pairs' => $request->user()->tradingPairs()->orderBy('name')->pluck('name'),
            'sessions' => $request->user()->tradingSessions()->orderBy('name')->pluck('name'),
            'accounts' => $request->user()->accountBalances()->orderBy('account_name')->get(['id', 'account_name', 'balance']),
            'checklistRules' => $request->user()->checklistRules()->orderBy('sort_order')->pluck('name'),
        ]);
    }

    public function show(TradeJournal $tradeJournal)
    {
        if ($tradeJournal->user_id !== auth()->id()) {
            abort(403);
        }

        $tradeJournal->load('accountBalance');

        return Inertia::render('user/trade-journals/show', [
            'journal' => $tradeJournal,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_balance_id' => ['required', 'exists:account_balances,id'],
            'trade_date' => ['required', 'date'],
            'day' => ['required', 'string', 'max:20'],
            'pair' => ['required', 'string', 'max:20'],
            'session' => ['required', 'string', 'max:50'],
            'hft_market_trend' => ['required', 'string', 'max:50'],
            'mft_market_trend' => ['required', 'string', 'max:50'],
            'direction' => ['required', 'in:long,short'],
            'risk_reward' => ['nullable', 'string', 'max:20'],
            'lot_size' => ['nullable', 'numeric', 'min:0.01'],
            'result' => ['nullable', 'in:profit,loss'],
            'profit_loss_amount' => ['nullable', 'numeric'],
            'trade_comment' => ['nullable', 'string', 'max:2000'],
            'hft_entry_image' => ['nullable', 'image', 'max:5120'],
            'mft_entry_image' => ['nullable', 'image', 'max:5120'],
            'lft_entry_image' => ['nullable', 'image', 'max:5120'],
            'red_news_time' => ['nullable', 'string', 'max:100'],
            'checklist' => ['nullable', 'array'],
            'checklist.*' => ['string', 'max:100'],
        ]);

        // Handle image uploads
        foreach (['hft_entry_image', 'mft_entry_image', 'lft_entry_image'] as $imageField) {
            if ($request->hasFile($imageField)) {
                $file = $request->file($imageField);
                $filename = time() . '_' . $imageField . '_' . $file->hashName();
                $file->move(public_path('uploads/trade-journals'), $filename);
                $validated[$imageField] = 'uploads/trade-journals/' . $filename;
            } else {
                unset($validated[$imageField]);
            }
        }

        $validated['user_id'] = $request->user()->id;

        $journal = TradeJournal::create($validated);

        // Update account balance with profit/loss
        if ($journal->profit_loss_amount && $journal->account_balance_id) {
            $account = \App\Models\AccountBalance::find($journal->account_balance_id);
            if ($account) {
                $amount = $journal->result === 'loss' ? -abs($journal->profit_loss_amount) : abs($journal->profit_loss_amount);
                $account->increment('balance', $amount);
            }
        }

        return redirect()->route('user.trade-journals.index')
            ->with('success', 'Trade journal entry created successfully.');
    }

    public function edit(Request $request, TradeJournal $tradeJournal)
    {
        if ($tradeJournal->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('user/trade-journals/edit', [
            'journal' => $tradeJournal,
            'pairs' => $request->user()->tradingPairs()->orderBy('name')->pluck('name'),
            'sessions' => $request->user()->tradingSessions()->orderBy('name')->pluck('name'),
            'accounts' => $request->user()->accountBalances()->orderBy('account_name')->get(['id', 'account_name', 'balance']),
            'checklistRules' => $request->user()->checklistRules()->orderBy('sort_order')->pluck('name'),
        ]);
    }

    public function update(Request $request, TradeJournal $tradeJournal)
    {
        if ($tradeJournal->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'account_balance_id' => ['required', 'exists:account_balances,id'],
            'trade_date' => ['required', 'date'],
            'day' => ['required', 'string', 'max:20'],
            'pair' => ['required', 'string', 'max:20'],
            'session' => ['required', 'string', 'max:50'],
            'hft_market_trend' => ['required', 'string', 'max:50'],
            'mft_market_trend' => ['required', 'string', 'max:50'],
            'direction' => ['required', 'in:long,short'],
            'risk_reward' => ['nullable', 'string', 'max:20'],
            'lot_size' => ['nullable', 'numeric', 'min:0.01'],
            'result' => ['nullable', 'in:profit,loss'],
            'profit_loss_amount' => ['nullable', 'numeric'],
            'trade_comment' => ['nullable', 'string', 'max:2000'],
            'hft_entry_image' => ['nullable', 'image', 'max:5120'],
            'mft_entry_image' => ['nullable', 'image', 'max:5120'],
            'lft_entry_image' => ['nullable', 'image', 'max:5120'],
            'remove_hft_entry_image' => ['nullable'],
            'remove_mft_entry_image' => ['nullable'],
            'remove_lft_entry_image' => ['nullable'],
            'red_news_time' => ['nullable', 'string', 'max:100'],
            'checklist' => ['nullable', 'array'],
            'checklist.*' => ['string', 'max:100'],
        ]);

        // Handle image uploads and removals
        foreach (['hft_entry_image', 'mft_entry_image', 'lft_entry_image'] as $imageField) {
            if ($request->hasFile($imageField)) {
                // Delete old image if exists
                if ($tradeJournal->$imageField && file_exists(public_path($tradeJournal->$imageField))) {
                    unlink(public_path($tradeJournal->$imageField));
                }
                $file = $request->file($imageField);
                $filename = time() . '_' . $imageField . '_' . $file->hashName();
                $file->move(public_path('uploads/trade-journals'), $filename);
                $validated[$imageField] = 'uploads/trade-journals/' . $filename;
            } elseif (filter_var($request->input("remove_{$imageField}"), FILTER_VALIDATE_BOOLEAN)) {
                // User explicitly removed the image
                if ($tradeJournal->$imageField && file_exists(public_path($tradeJournal->$imageField))) {
                    unlink(public_path($tradeJournal->$imageField));
                }
                $validated[$imageField] = null;
            } else {
                unset($validated[$imageField]);
            }
            unset($validated["remove_{$imageField}"]);
        }

        // Reverse old balance adjustment
        if ($tradeJournal->profit_loss_amount && $tradeJournal->account_balance_id) {
            $oldAccount = \App\Models\AccountBalance::find($tradeJournal->account_balance_id);
            if ($oldAccount) {
                $oldAmount = $tradeJournal->result === 'loss' ? abs($tradeJournal->profit_loss_amount) : -abs($tradeJournal->profit_loss_amount);
                $oldAccount->increment('balance', $oldAmount);
            }
        }

        $tradeJournal->update($validated);

        // Apply new balance adjustment
        if ($tradeJournal->profit_loss_amount && $tradeJournal->account_balance_id) {
            $newAccount = \App\Models\AccountBalance::find($tradeJournal->account_balance_id);
            if ($newAccount) {
                $newAmount = $tradeJournal->result === 'loss' ? -abs($tradeJournal->profit_loss_amount) : abs($tradeJournal->profit_loss_amount);
                $newAccount->increment('balance', $newAmount);
            }
        }

        return redirect()->route('user.trade-journals.index')
            ->with('success', 'Trade journal entry updated successfully.');
    }

    public function destroy(TradeJournal $tradeJournal)
    {
        if ($tradeJournal->user_id !== auth()->id()) {
            abort(403);
        }

        // Delete associated images
        foreach (['hft_entry_image', 'mft_entry_image', 'lft_entry_image'] as $imageField) {
            if ($tradeJournal->$imageField && file_exists(public_path($tradeJournal->$imageField))) {
                unlink(public_path($tradeJournal->$imageField));
            }
        }

        // Reverse balance adjustment before deleting
        if ($tradeJournal->profit_loss_amount && $tradeJournal->account_balance_id) {
            $account = \App\Models\AccountBalance::find($tradeJournal->account_balance_id);
            if ($account) {
                $amount = $tradeJournal->result === 'loss' ? abs($tradeJournal->profit_loss_amount) : -abs($tradeJournal->profit_loss_amount);
                $account->increment('balance', $amount);
            }
        }

        $tradeJournal->delete();

        return redirect()->route('user.trade-journals.index')
            ->with('success', 'Trade journal entry deleted successfully.');
    }
}
