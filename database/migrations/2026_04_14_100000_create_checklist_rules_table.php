<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checklist_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'name']);
        });

        Schema::table('trade_journals', function (Blueprint $table) {
            $table->json('checklist')->nullable()->after('red_news_time');
        });
    }

    public function down(): void
    {
        Schema::table('trade_journals', function (Blueprint $table) {
            $table->dropColumn('checklist');
        });

        Schema::dropIfExists('checklist_rules');
    }
};
