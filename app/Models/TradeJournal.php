<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TradeJournal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'account_balance_id',
        'trade_date',
        'day',
        'pair',
        'session',
        'hft_market_trend',
        'mft_market_trend',
        'direction',
        'risk_reward',
        'lot_size',
        'result',
        'profit_loss_amount',
        'trade_comment',
        'hft_entry_image',
        'mft_entry_image',
        'lft_entry_image',
        'red_news_time',
        'checklist',
    ];

    protected function casts(): array
    {
        return [
            'trade_date' => 'date',
            'lot_size' => 'decimal:2',
            'profit_loss_amount' => 'decimal:2',
            'checklist' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function accountBalance(): BelongsTo
    {
        return $this->belongsTo(\App\Models\AccountBalance::class);
    }
}
