<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('trade_journals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('account_balance_id');
            $table->date('trade_date');
            $table->string('day');
            $table->string('pair');
            $table->string('session');
            $table->string('hft_market_trend');
            $table->string('mft_market_trend');
            $table->enum('direction', ['long', 'short']);
            $table->string('risk_reward')->nullable();
            $table->decimal('lot_size', 10, 2)->nullable();
            $table->enum('result', ['profit', 'loss'])->nullable();
            $table->decimal('profit_loss_amount', 15, 2)->nullable();
            $table->text('trade_comment')->nullable();
            $table->string('hft_entry_image')->nullable();
            $table->string('mft_entry_image')->nullable();
            $table->string('lft_entry_image')->nullable();
            $table->string('red_news_time')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trade_journals');
    }
};
