
import Link from 'next/link';

export function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white text-slate-900">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-linear-to-b from-emerald-50/80 via-white to-white z-0 pointer-events-none" />

            {/* Abstract Shapes/Texture */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-200/60 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-[40%] right-[10%] w-[40%] h-[40%] bg-blue-200/60 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8">
                <div className="inline-block animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <span className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-sm font-medium tracking-wide">
                        Reimagining Global Reforestation
                    </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                    Habitat: Adaptive <br />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-cyan-600">
                        Reforestation Management
                    </span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    Transforming one-time planting into long-term ecosystem survival.
                    Monitor, predict, and adapt for decades of growth.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    <Link
                        href="/analysis"
                        className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-emerald-600/25 flex items-center justify-center gap-2"
                    >
                        Start Restoration Project
                    </Link>
                    <Link
                        href="#features"
                        className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-semibold text-lg transition-all flex items-center justify-center shadow-sm"
                    >
                        Learn How It Works
                    </Link>
                </div>
            </div>
        </section>
    );
}
