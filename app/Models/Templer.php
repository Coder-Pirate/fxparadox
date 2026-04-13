<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Templer extends Model
{
    protected $fillable = ['user_id', 'title', 'strategy_note', 'image'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
