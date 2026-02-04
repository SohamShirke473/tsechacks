
import {
    TreePine,
    Droplets,
    Activity,
    Sprout,
    AlertTriangle,
    Globe,
    Layers
} from 'lucide-react';

export function InfoSection() {
    return (
        <div className="bg-white text-slate-900" id="features">

            {/* Problem Section */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">The Hidden Crisis in Reforestation</h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Millions of saplings die annually because initial planning was flawed or management failed to adapt.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:border-red-200 hover:shadow-lg transition-all">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-3">Static Planning</h3>
                            <p className="text-slate-600">
                                Current approaches use outdated maps, ignoring shifting pH levels, mineral depletion, or drought risks.
                            </p>
                        </div>

                        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:border-red-200 hover:shadow-lg transition-all">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                                <Activity className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-3">Reactive Management</h3>
                            <p className="text-slate-600">
                                Planting happens once, monitoring is sporadic. Problems are often detected only after plantations have failed.
                            </p>
                        </div>

                        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:border-red-200 hover:shadow-lg transition-all">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                                <Globe className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-3">Disconnected Data</h3>
                            <p className="text-slate-600">
                                No connection between satellite data and the reality of ground-level soil conditions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Solution/Features Section */}
            <section className="py-20 px-6 bg-slate-50/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-emerald-600 font-semibold tracking-wider uppercase text-sm">The Solution</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mt-3 mb-6">End-to-End Ecosystem Intelligence</h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            A platform that transforms one-time planting into a continuously adapting survival strategy.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">

                        {/* Feature 1 */}
                        <div className="flex gap-6 group hover:bg-white p-6 rounded-2xl transition-all hover:shadow-md border border-transparent hover:border-slate-100">
                            <div className="shrink-0 w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200/50 transition-colors">
                                <TreePine className="w-8 h-8 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Strategic Site & Species Matching</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Utilize geospatial and remote sensing data to identify high-priority restoration zones and suggest native species optimized for the local microclimate.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex gap-6 group hover:bg-white p-6 rounded-2xl transition-all hover:shadow-md border border-transparent hover:border-slate-100">
                            <div className="shrink-0 w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200/50 transition-colors">
                                <Layers className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Soil & Mineral Intelligence</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Incorporate localized ground variables—pH levels, nutrient content, and moisture—to refine initial planting choices and long-term care.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex gap-6 group hover:bg-white p-6 rounded-2xl transition-all hover:shadow-md border border-transparent hover:border-slate-100">
                            <div className="shrink-0 w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200/50 transition-colors">
                                <AlertTriangle className="w-8 h-8 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Predictive Risk & Early Warning</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Forecast environmental stressors like extreme heat, drought patterns, or water scarcity up to weeks in advance.
                                </p>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="flex gap-6 group hover:bg-white p-6 rounded-2xl transition-all hover:shadow-md border border-transparent hover:border-slate-100">
                            <div className="shrink-0 w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200/50 transition-colors">
                                <Sprout className="w-8 h-8 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Continuous Health Analytics</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Track land-health indicators and vegetation density over time to quantify restoration progress and sequestered carbon.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}
