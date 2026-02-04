"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

interface RiskAnalyticsPanelProps {
    selectedProjectId: Id<"projects"> | null;
}

export default function RiskAnalyticsPanel({ selectedProjectId }: RiskAnalyticsPanelProps) {
    const [loadingAnalysisId, setLoadingAnalysisId] = useState<Id<"analyses"> | null>(null);
    const projectData = useQuery(
        api.projects.getProjectWithAnalytics,
        selectedProjectId ? { projectId: selectedProjectId } : "skip"
    );
    const predictRisk = useAction(api.riskPrediction.predictRisk);

    if (!selectedProjectId) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="text-gray-300 text-6xl">📊</div>
                    <h3 className="text-xl font-semibold text-gray-600">Select a Project</h3>
                    <p className="text-gray-400">Choose a project from the list to view analytics</p>
                </div>
            </div>
        );
    }

    if (!projectData) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 h-full flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    <span className="text-gray-600">Loading project data...</span>
                </div>
            </div>
        );
    }

    const handleFetchRiskPrediction = async (analysisId: Id<"analyses">, lat: number, lon: number, species: string) => {
        try {
            setLoadingAnalysisId(analysisId);
            await predictRisk({ analysisId, lat, lon, species });
        } catch (error) {
            console.error("Error fetching risk prediction:", error);
            alert("Failed to fetch risk prediction. Please try again.");
        } finally {
            setLoadingAnalysisId(null);
        }
    };

    const chartConfig = {
        avg_temp: {
            label: "Avg Temp (°C)",
            color: "hsl(var(--chart-1))",
        },
        total_rain: {
            label: "Total Rain (mm)",
            color: "hsl(var(--chart-2))",
        },
        temp_limit: {
            label: "Temp Limit",
            color: "hsl(var(--chart-3))",
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full overflow-hidden flex flex-col">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{projectData.name}</h2>
                <p className="text-gray-600 mt-1">{projectData.description}</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {!projectData.analyses || projectData.analyses.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                        <div className="text-gray-300 text-5xl">🌱</div>
                        <p className="text-gray-500 font-medium">No analyses yet</p>
                        <p className="text-gray-400 text-sm">Add site analyses to this project to view risk predictions</p>
                    </div>
                ) : (
                    projectData.analyses.map((analysis) => {
                        const hasRiskData = !!analysis.riskPrediction;
                        const isLoading = loadingAnalysisId === analysis._id;

                        // Get species from selected plants or results
                        const species = analysis.selectedPlants?.[0] || analysis.results?.[0]?.plantName || "Unknown";

                        // Type safe access to risk prediction data based on new schema
                        // Note: The schema type on frontend might lag until generic generation, so we cast if needed or rely on robust checks
                        const riskData = analysis.riskPrediction as any;

                        return (
                            <div key={analysis._id} className="border border-gray-200 rounded-xl p-6 space-y-4 bg-gradient-to-br from-white to-gray-50">
                                {/* Analysis Header */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900">
                                            {analysis.site_name || `Site Analysis`}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            📍 {analysis.lat.toFixed(4)}, {analysis.lon.toFixed(4)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            🌿 Species: <span className="font-medium text-gray-700">{species}</span>
                                        </p>
                                    </div>
                                    {!hasRiskData && (
                                        <button
                                            onClick={() => handleFetchRiskPrediction(analysis._id, analysis.lat, analysis.lon, species)}
                                            disabled={isLoading}
                                            type="button"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                                    <span>Loading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>🔮</span>
                                                    <span>Predict Risk</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* Risk Prediction Data */}
                                {hasRiskData && riskData && (
                                    <div className="space-y-6 mt-4">

                                        {/* Long-term Metrics */}
                                        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <span>🛡️</span>
                                                    Long-term Analysis <span className="text-xs font-normal text-gray-500">({riskData.metadata.analysis_duration})</span>
                                                </h4>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${riskData.metadata.trend_status === 'STABLE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                                    {riskData.metadata.trend_status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Survival Probability (3yr)</p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className="bg-green-500 h-full rounded-full transition-all duration-500"
                                                                style={{ width: `${(riskData.long_term.survival_probability_3yr * 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="font-bold text-gray-900">{(riskData.long_term.survival_probability_3yr * 100).toFixed(0)}%</span>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Annual Rainfall</p>
                                                    <p className="text-lg font-bold text-blue-600 mt-1">{riskData.long_term.average_annual_rainfall} mm</p>
                                                </div>
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Primary Threat</p>
                                                    <p className="text-lg font-bold text-red-500 mt-1">{riskData.long_term.primary_threat}</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Heat Stress Trend</p>
                                                <div className="grid grid-cols-3 gap-2 text-center">
                                                    {Object.entries(riskData.long_term.heat_stress_trend).map(([year, val]: [string, any]) => (
                                                        <div key={year} className="bg-orange-50 p-2 rounded border border-orange-100">
                                                            <div className="text-xs text-gray-400">{year.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
                                                            <div className="font-semibold text-orange-700">{val} days</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Time Series Chart */}
                                        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                                            <div className="mb-4">
                                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <span>📈</span>
                                                    Climate Projection
                                                </h4>
                                                <p className="text-sm text-gray-500 mt-1">{riskData.time_series_graph.description}</p>
                                            </div>

                                            <div className="h-[300px] w-full">
                                                <ChartContainer config={chartConfig} className="h-full w-full">
                                                    <AreaChart data={riskData.time_series_graph.data_points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="fillRain" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="var(--color-total_rain)" stopOpacity={0.8} />
                                                                <stop offset="95%" stopColor="var(--color-total_rain)" stopOpacity={0.1} />
                                                            </linearGradient>
                                                            <linearGradient id="fillTemp" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="var(--color-avg_temp)" stopOpacity={0.8} />
                                                                <stop offset="95%" stopColor="var(--color-avg_temp)" stopOpacity={0.1} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                                        <XAxis
                                                            dataKey="date"
                                                            tickLine={false}
                                                            axisLine={false}
                                                            tickMargin={8}
                                                            minTickGap={32}
                                                            tickFormatter={(value) => {
                                                                const date = new Date(value);
                                                                return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
                                                            }}
                                                        />
                                                        <YAxis yAxisId="left" orientation="left" stroke="var(--color-avg_temp)" />
                                                        <YAxis yAxisId="right" orientation="right" stroke="var(--color-total_rain)" />
                                                        <ChartTooltip content={<ChartTooltipContent labelFormatter={(value) => new Date(value).toLocaleDateString()} />} />
                                                        <ChartLegend content={<ChartLegendContent />} />
                                                        <Area yAxisId="right" type="monotone" dataKey="total_rain" fill="url(#fillRain)" fillOpacity={0.4} stroke="var(--color-total_rain)" stackId="1" />
                                                        <Area yAxisId="left" type="monotone" dataKey="avg_temp" fill="url(#fillTemp)" fillOpacity={0.4} stroke="var(--color-avg_temp)" stackId="2" />
                                                        {/* Optional: Add Temp Limit Line if needed, though Area chart might get busy */}
                                                    </AreaChart>
                                                </ChartContainer>
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
