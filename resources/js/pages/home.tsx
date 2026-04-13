import { Head, Link, usePage } from '@inertiajs/react';
import {
    TrendingUp, BarChart3, Shield, Zap, Target, LineChart,
    ArrowRight, ChevronRight, Activity, Layers,
    Sun, Moon, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import type { SiteContentValues } from '@/types/site-content';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    TrendingUp, BarChart3, Shield, Zap, Target, LineChart, Activity, Layers,
    ArrowRight, ChevronRight,
};

function DynamicIcon({ name, className }: { name: string; className?: string }) {
    const Icon = iconMap[name] || Zap;
    return <Icon className={className} />;
}

type Props = {
    contents: SiteContentValues;
    canRegister: boolean;
    auth: { user: { id: number } | null };
};

export default function Home() {
    const { contents = {}, canRegister, auth } = usePage<Props>().props;
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const hero = contents.hero ?? {};
    const feature1 = contents.feature_1 ?? {};
    const feature2 = contents.feature_2 ?? {};
    const feature3 = contents.feature_3 ?? {};
    const about = contents.about ?? {};
    const cta = contents.cta ?? {};
    const footer = contents.footer ?? {};

    const features = [
        { icon: feature1.icon ?? 'BarChart3', title: feature1.title ?? 'Trade Journal', description: feature1.description ?? '' },
        { icon: feature2.icon ?? 'Target', title: feature2.title ?? 'Strategy Templates', description: feature2.description ?? '' },
        { icon: feature3.icon ?? 'TrendingUp', title: feature3.title ?? 'Performance Analytics', description: feature3.description ?? '' },
    ];

    const toggleTheme = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <>
            <Head title={hero.title ?? 'FX Paradox'} />
            <div className="min-h-screen bg-background text-foreground">
                {/* Navbar */}
                <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground sm:h-9 sm:w-9">
                                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <span className="text-lg font-bold sm:text-xl">FX Paradox</span>
                        </Link>

                        {/* Desktop nav */}
                        <div className="hidden items-center gap-3 sm:flex">
                            <button
                                onClick={toggleTheme}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border transition hover:bg-accent"
                                aria-label="Toggle theme"
                            >
                                {resolvedAppearance === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </button>
                            {auth?.user ? (
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                                >
                                    Dashboard
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="rounded-lg px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent"
                                    >
                                        Log in
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href="/register"
                                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                                        >
                                            Get Started
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Mobile nav buttons */}
                        <div className="flex items-center gap-2 sm:hidden">
                            <button
                                onClick={toggleTheme}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border transition hover:bg-accent"
                                aria-label="Toggle theme"
                            >
                                {resolvedAppearance === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </button>
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border transition hover:bg-accent"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {mobileMenuOpen && (
                        <div className="border-t border-border/50 bg-background px-4 py-4 sm:hidden">
                            <div className="flex flex-col gap-2">
                                {auth?.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                                    >
                                        Dashboard
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="w-full rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground transition hover:bg-accent"
                                        >
                                            Log in
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href="/register"
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                                            >
                                                Get Started
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </nav>

                {/* Hero */}
                <section className="relative overflow-hidden py-12 sm:py-20 lg:py-32">
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2">
                            <div className="max-w-2xl">
                                {hero.subtitle && (
                                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:mb-4 sm:px-4 sm:py-1.5 sm:text-sm">
                                        <Activity className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                        {hero.subtitle}
                                    </div>
                                )}
                                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                                    {hero.title ?? 'Master Your Forex Trading Journey'}
                                </h1>
                                <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
                                    {hero.description ?? 'Track, analyze, and improve your trading performance with our comprehensive forex journal platform.'}
                                </p>
                                <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">
                                    <Link
                                        href={auth?.user ? '/dashboard' : '/register'}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
                                    >
                                        {hero.button_text ?? 'Start Trading Journal'}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium transition hover:bg-accent"
                                    >
                                        Learn More
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>

                            {/* Stats card - visible on all screens */}
                            <div className="relative">
                                <img
                                    src={hero.image ? `/storage/${hero.image}` : '/images/demo-hero.svg'}
                                    alt="Hero"
                                    className="w-full rounded-2xl border shadow-2xl shadow-primary/10"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="border-t border-border/50 py-12 sm:py-20 lg:py-28">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                                {contents.features?.title ?? 'Everything You Need to Succeed'}
                            </h2>
                            <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:mt-4 sm:text-lg">
                                {contents.features?.description ?? 'Powerful tools designed to help you become a better trader.'}
                            </p>
                        </div>
                        <div className="mt-10 grid gap-6 sm:mt-16 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
                            {features.map((feature, i) => (
                                <div
                                    key={i}
                                    className="group rounded-2xl border border-border/50 bg-card p-6 transition hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 sm:p-8"
                                >
                                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground sm:mb-5 sm:h-12 sm:w-12">
                                        <DynamicIcon name={feature.icon} className="h-5 w-5 sm:h-6 sm:w-6" />
                                    </div>
                                    <h3 className="text-base font-semibold sm:text-lg">{feature.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* About */}
                <section className="border-t border-border/50 bg-accent/30 py-12 sm:py-20 lg:py-28">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2">
                            <div className="order-2 lg:order-1">
                                <img
                                    src={about.image ? `/storage/${about.image}` : '/images/demo-about.svg'}
                                    alt="About"
                                    className="w-full rounded-2xl border shadow-xl"
                                />
                            </div>
                            <div className="order-1 lg:order-2">
                                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                                    {about.title ?? 'Built for Serious Traders'}
                                </h2>
                                <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
                                    {about.description ?? 'FX Paradox helps you maintain discipline, track your progress, and make data-driven decisions to improve your trading performance.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="border-t border-border/50 py-12 sm:py-20 lg:py-28">
                    <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                            {cta.title ?? 'Ready to Transform Your Trading?'}
                        </h2>
                        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground sm:mt-4 sm:text-lg">
                            {cta.description ?? 'Join traders who are already using FX Paradox to track and improve their performance.'}
                        </p>
                        <div className="mt-6 sm:mt-8">
                            <Link
                                href={auth?.user ? '/dashboard' : '/register'}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 sm:px-8 sm:py-3.5"
                            >
                                {cta.button_text ?? 'Get Started Free'}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-border/50 py-6 sm:py-8">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                <span className="font-semibold">FX Paradox</span>
                            </div>
                            <p className="text-xs text-muted-foreground sm:text-sm">
                                {footer.copyright ?? `© ${new Date().getFullYear()} FX Paradox. All rights reserved.`}
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
