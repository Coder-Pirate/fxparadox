<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ExportUsersController;
use App\Http\Controllers\Admin\SiteContentController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Manager\DashboardController as ManagerDashboardController;
use App\Http\Controllers\User\AccountBalanceController;
use App\Http\Controllers\User\ChecklistRuleController;
use App\Http\Controllers\User\DashboardController as UserDashboardController;
use App\Http\Controllers\User\TemplerController;
use App\Http\Controllers\User\TradeJournalController;
use App\Http\Controllers\User\TradingPairController;
use App\Http\Controllers\User\TradingSessionController;
use App\Http\Controllers\User\TradingSettingsController;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::get('/', HomeController::class)->name('home');

// Pending approval page (authenticated but not approved)
Route::middleware(['auth'])->get('approval/pending', function () {
    if (auth()->user()->isApproved() || auth()->user()->isAdmin()) {
        return redirect()->route('dashboard');
    }

    return \Inertia\Inertia::render('auth/approval-pending');
})->name('approval.pending');

// Redirect /dashboard to the correct role-based dashboard
Route::middleware(['auth', 'verified', 'approved'])->get('dashboard', function () {
    $url = match (auth()->user()->role) {
        User::ROLE_ADMIN => '/admin/dashboard',
        User::ROLE_MANAGER => '/manager/dashboard',
        default => '/user/dashboard',
    };

    return redirect($url);
})->name('dashboard');

// Admin routes (admins are always approved, no 'approved' middleware needed)
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', AdminDashboardController::class)->name('dashboard');
    Route::get('users/export/excel', [ExportUsersController::class, 'excel'])->name('users.export.excel');
    Route::get('users/export/pdf', [ExportUsersController::class, 'pdf'])->name('users.export.pdf');
    Route::resource('users', UserController::class)->except(['show']);
    Route::post('users/{user}/approve', [\App\Http\Controllers\Admin\UserApprovalController::class, 'approve'])->name('users.approve');
    Route::post('users/{user}/reject', [\App\Http\Controllers\Admin\UserApprovalController::class, 'reject'])->name('users.reject');
    Route::post('users/{user}/activate', [\App\Http\Controllers\Admin\UserApprovalController::class, 'activate'])->name('users.activate');
    Route::post('users/{user}/deactivate', [\App\Http\Controllers\Admin\UserApprovalController::class, 'deactivate'])->name('users.deactivate');
    Route::get('site-content', [SiteContentController::class, 'index'])->name('site-content.index');
    Route::post('site-content', [SiteContentController::class, 'update'])->name('site-content.update');
});

// Manager routes
Route::middleware(['auth', 'verified', 'approved', 'role:manager'])->prefix('manager')->name('manager.')->group(function () {
    Route::get('dashboard', ManagerDashboardController::class)->name('dashboard');
});

// User routes
Route::middleware(['auth', 'verified', 'approved', 'role:user'])->prefix('user')->name('user.')->group(function () {
    Route::get('dashboard', UserDashboardController::class)->name('dashboard');
    Route::resource('trade-journals', TradeJournalController::class);
    Route::resource('templers', TemplerController::class);

    // Trading settings
    Route::get('trading-settings', TradingSettingsController::class)->name('trading-settings');
    Route::resource('trading-pairs', TradingPairController::class)->only(['store', 'update', 'destroy']);
    Route::resource('trading-sessions', TradingSessionController::class)->only(['store', 'update', 'destroy']);
    Route::resource('account-balances', AccountBalanceController::class)->only(['store', 'update', 'destroy']);
    Route::resource('checklist-rules', ChecklistRuleController::class)->only(['store', 'update', 'destroy']);
});

require __DIR__.'/settings.php';
