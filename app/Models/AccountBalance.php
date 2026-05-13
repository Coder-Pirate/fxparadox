<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountBalance extends Model
{
    protected $fillable = ['user_id', 'account_name', 'balance', 'starting_balance'];

    protected function casts(): array
    {
        return [
            'balance' => 'decimal:2',
            'starting_balance' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
