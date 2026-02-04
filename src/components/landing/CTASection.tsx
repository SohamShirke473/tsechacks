
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
    return (
        <section className="py-24 px-6 bg-emerald-50 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-200/40 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                    Ready to Build Resilient Forests?
                </h2>
                <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                    Join the platform that helps you plan, manage, and protect your reforestation projects for decades to come.
                </p>

                <Link
                    href="/analysis"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white hover:bg-emerald-700 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-xl shadow-emerald-600/20"
                >
                    Get Started Now
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </section>
    );
}
