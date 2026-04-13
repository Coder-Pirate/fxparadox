<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => '1234',
            'role' => 'admin',
            'is_approved' => true,
            'is_active' => true,
        ]);

        User::factory()->create([
            'name' => 'Manager User',
            'email' => 'manager@example.com',
            'password' => '1234',
            'role' => 'manager',
            'is_approved' => true,
            'is_active' => true,
        ]);

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => '1234',
            'role' => 'user',
            'is_approved' => true,
            'is_active' => true,
        ]);

        User::factory(10)->create();
    }
}
