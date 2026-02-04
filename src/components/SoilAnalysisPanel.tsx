'use client';

import { AlertTriangleIcon, DropletsIcon, SproutIcon, ThermometerIcon, CloudRainIcon, InfoIcon } from 'lucide-react';

interface AnalysisData {
    soil: {
        ph: number;
        nitrogen: number;
        healthScore: number;
        healthLabel: string;
        isSimulated?: boolean;
    };
    climate: {
        annualRainfall: number;
        avgTemp: number;
        classification: string;
        dryMonths: number;
    };
    recommendations: any[];
    carePlan: any[];
}

export default function SoilAnalysisPanel({ data, loading }: { data: AnalysisData | null; loading: boolean }) {
    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-pulse">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <SproutIcon className="w-8 h-8 text-green-600 animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Analyzing Ecosystem...</h3>
                <p className="text-gray-500 mt-2 text-sm">Synthesizing Climate & Pluviometry Data...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <CloudRainIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Select a Location</h3>
                <p className="text-gray-500 mt-2">Click anywhere to analyze soil viability & water stress.</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-6 space-y-6">
            {/* Header Score */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-6 relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h2 className="text-xs font-bold tracking-wider text-green-800 uppercase">Site Potential</h2>
                        <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-5xl font-black text-green-700">{data.soil.healthScore}</span>
                            <span className="text-sm text-green-600 font-medium">/ 100</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{data.soil.healthLabel}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <div className="px-3 py-1 bg-white/50 backdrop-blur text-green-800 text-xs font-bold rounded-full border border-green-100 inline-block shadow-sm">
                            {data.climate.classification}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            <DropletsIcon className="w-3 h-3" />
                            {data.climate.dryMonths} Dry Months/Yr
                        </div>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mt-6 relative z-10">
                    <MetricBox label="Est. pH" value={data.soil.ph.toFixed(1)} icon={<ThermometerIcon className="w-3.5 h-3.5 text-orange-500" />} />
                    <MetricBox label="Mean Temp" value={`${data.climate.avgTemp}°C`} icon={<ThermometerIcon className="w-3.5 h-3.5 text-red-500" />} />
                    <MetricBox label="Nitrogen" value={data.soil.nitrogen > 2.0 ? "High" : "Moderate"} icon={<SproutIcon className="w-3.5 h-3.5 text-green-500" />} />
                    <MetricBox label="Rainfall" value={`${data.climate.annualRainfall}mm`} icon={<CloudRainIcon className="w-3.5 h-3.5 text-blue-500" />} />
                </div>

                {data.soil.isSimulated && (
                    <div className="mt-3 flex items-start gap-1.5 text-[10px] text-gray-400 leading-tight">
                        <InfoIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        Soil values are derived from climatological models due to missing local sensor data.
                    </div>
                )}
            </div>

            {/* Care Plan (Priority) */}
            {data.carePlan.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                        <AlertTriangleIcon className="w-4 h-4 text-amber-600" />
                        Critical Actions
                    </h3>
                    <div className="space-y-2">
                        {data.carePlan.map((action: any, i: number) => (
                            <div key={i} className="flex gap-3 p-3 bg-white rounded-lg border border-amber-100 shadow-sm hover:border-amber-300 transition-colors">
                                <div className="mt-0.5 text-amber-600">
                                    <AlertTriangleIcon className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                                        {action.action}
                                        {action.priority === 'High' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                                    </div>
                                    <div className="text-sm text-gray-700 mt-0.5 leading-snug">{action.detail}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <SproutIcon className="w-4 h-4 text-green-600" />
                    Best Species Match
                </h3>
                <div className="space-y-3">
                    {data.recommendations.map((species: any) => (
                        <div key={species.name} className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm hover:border-green-200 transition-colors group">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="font-bold text-gray-800 group-hover:text-green-700 transition-colors">{species.name}</h4>
                                <span className={`text-xs font-mono px-2 py-0.5 rounded border ${species.matchScore > 80 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                    {species.matchScore}% Match
                                </span>
                            </div>

                            {/* Match Reasons / Warnings */}
                            <div className="flex flex-wrap gap-1 mb-2">
                                {species.reasons && species.reasons.length > 0 ? (
                                    species.reasons.map((r: string) => (
                                        <span key={r} className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100">
                                            ⚠️ {r}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100">
                                        ✨ Perfect conditions
                                    </span>
                                )}
                            </div>

                            <p className="text-xs text-gray-500 line-clamp-2">{species.description}</p>
                        </div>
                    ))}
                    {data.recommendations.length === 0 && (
                        <div className="p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-500 italic">
                            No native species found that perfectly match these difficult conditions.
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}

function MetricBox({ label, value, icon }: { label: string; value: string; icon: any }) {
    return (
        <div className="bg-white/60 p-2.5 rounded-lg flex flex-col gap-1 border border-white shadow-sm">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wide">
                {icon} {label}
            </div>
            <div className="text-base font-bold text-gray-900 truncate">{value}</div>
        </div>
    );
}
