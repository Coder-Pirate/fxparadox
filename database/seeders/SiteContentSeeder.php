<?php

namespace Database\Seeders;

use App\Models\SiteContent;
use Illuminate\Database\Seeder;

class SiteContentSeeder extends Seeder
{
    public function run(): void
    {
        $contents = [
            // Hero Section
            ['section' => 'hero', 'key' => 'title', 'type' => 'text', 'value' => 'Master Your Forex Trading Journey', 'order' => 1],
            ['section' => 'hero', 'key' => 'subtitle', 'type' => 'text', 'value' => 'Professional Trading Platform', 'order' => 2],
            ['section' => 'hero', 'key' => 'description', 'type' => 'textarea', 'value' => 'Track, analyze, and improve your trading performance with our comprehensive forex journal platform. Make data-driven decisions and grow your portfolio.', 'order' => 3],
            ['section' => 'hero', 'key' => 'button_text', 'type' => 'text', 'value' => 'Start Trading Journal', 'order' => 4],
            ['section' => 'hero', 'key' => 'image', 'type' => 'image', 'value' => null, 'order' => 5],

            // Features Section Header
            ['section' => 'features', 'key' => 'title', 'type' => 'text', 'value' => 'Everything You Need to Succeed', 'order' => 1],
            ['section' => 'features', 'key' => 'description', 'type' => 'textarea', 'value' => 'Powerful tools designed to help you become a better trader.', 'order' => 2],

            // Feature 1
            ['section' => 'feature_1', 'key' => 'icon', 'type' => 'icon', 'value' => 'BarChart3', 'order' => 1],
            ['section' => 'feature_1', 'key' => 'title', 'type' => 'text', 'value' => 'Trade Journal', 'order' => 2],
            ['section' => 'feature_1', 'key' => 'description', 'type' => 'textarea', 'value' => 'Log every trade with detailed entry/exit analysis, screenshots, and performance tracking to identify patterns in your trading.', 'order' => 3],

            // Feature 2
            ['section' => 'feature_2', 'key' => 'icon', 'type' => 'icon', 'value' => 'Target', 'order' => 1],
            ['section' => 'feature_2', 'key' => 'title', 'type' => 'text', 'value' => 'Strategy Templates', 'order' => 2],
            ['section' => 'feature_2', 'key' => 'description', 'type' => 'textarea', 'value' => 'Create and manage reusable strategy templates with notes and visual references to maintain consistency in your approach.', 'order' => 3],

            // Feature 3
            ['section' => 'feature_3', 'key' => 'icon', 'type' => 'icon', 'value' => 'TrendingUp', 'order' => 1],
            ['section' => 'feature_3', 'key' => 'title', 'type' => 'text', 'value' => 'Performance Analytics', 'order' => 2],
            ['section' => 'feature_3', 'key' => 'description', 'type' => 'textarea', 'value' => 'Visualize your win rate, P&L trends, and trading habits with an interactive dashboard and calendar view.', 'order' => 3],

            // About Section
            ['section' => 'about', 'key' => 'title', 'type' => 'text', 'value' => 'Built for Serious Traders', 'order' => 1],
            ['section' => 'about', 'key' => 'description', 'type' => 'textarea', 'value' => 'FX Paradox helps you maintain discipline, track your progress, and make data-driven decisions to improve your trading performance. Whether you are a beginner or a professional, our tools adapt to your workflow.', 'order' => 2],
            ['section' => 'about', 'key' => 'image', 'type' => 'image', 'value' => null, 'order' => 3],

            // CTA Section
            ['section' => 'cta', 'key' => 'title', 'type' => 'text', 'value' => 'Ready to Transform Your Trading?', 'order' => 1],
            ['section' => 'cta', 'key' => 'description', 'type' => 'textarea', 'value' => 'Join traders who are already using FX Paradox to track and improve their performance.', 'order' => 2],
            ['section' => 'cta', 'key' => 'button_text', 'type' => 'text', 'value' => 'Get Started Free', 'order' => 3],

            // Footer
            ['section' => 'footer', 'key' => 'copyright', 'type' => 'text', 'value' => '© 2026 FX Paradox. All rights reserved.', 'order' => 1],
        ];

        foreach ($contents as $content) {
            SiteContent::updateOrCreate(
                ['section' => $content['section'], 'key' => $content['key']],
                $content
            );
        }
    }
}
