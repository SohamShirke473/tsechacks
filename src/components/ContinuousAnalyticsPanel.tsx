"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Play, RotateCcw } from "lucide-react";

interface ContinuousAnalyticsPanelProps {
    selectedProjectId: Id<"projects"> | null;
    isDroughtSim: boolean;
}

export default function ContinuousAnalyticsPanel({ selectedProjectId, isDroughtSim }: ContinuousAnalyticsPanelProps) {
    // Keep internal state only if needed for something else, but here we rely on props

    // Fetch project data akin to RiskAnalyticsPanel
    const projectData = useQuery(
        api.projects.getProjectWithAnalytics,
        selectedProjectId ? { projectId: selectedProjectId } : "skip"
    );

    if (!selectedProjectId) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="text-gray-300 text-6xl">📊</div>
                    <h3 className="text-xl font-semibold text-gray-600">Select a Project</h3>
                    <p className="text-gray-400">Choose a project to view {isDroughtSim ? "simulations" : "analytics"}</p>
                </div>
            </div>
        );
    }

    if (!projectData) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 h-full flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                    <span className="text-gray-600">Loading project data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-50 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                        {isDroughtSim ? "Drought Simulation" : "Continuous Analytics"}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {isDroughtSim
                            ? "Simulate extreme weather scenarios and their impact on carbon growth"
                            : <span>Real-time satellite forestry data & carbon forecast for <strong>{projectData.name}</strong></span>
                        }
                    </p>
                </div>

                {isDroughtSim && (
                    <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50 text-xs">
                        Simulation Mode Active
                    </Badge>
                )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-8">
                {(!projectData.analyses || projectData.analyses.length === 0) ? (
                    <div className="text-center py-12 space-y-3">
                        <div className="text-gray-300 text-5xl">🌱</div>
                        <p className="text-gray-500 font-medium">No analyses yet</p>
                        <p className="text-gray-400 text-sm">Add site analyses to this project to run simulations</p>
                    </div>
                ) : (
                    projectData.analyses.map((analysis) => (
                        <ContinuousAnalysisCard
                            key={analysis._id}
                            analysis={analysis}
                            isDroughtSim={isDroughtSim}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function ContinuousAnalysisCard({ analysis, isDroughtSim }: { analysis: any, isDroughtSim: boolean }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const fetchContinuousAnalytics = useAction(api.continuousAnalytics.fetchContinuousAnalytics);

    const species = analysis.selectedPlants?.[0] || analysis.results?.[0]?.plantName || "Neem";

    // Read persisted data from the analysis
    const persistedData = analysis.continuousAnalytics;
    const hasData = !!persistedData;

    // Check if user needs to re-run (mode mismatch: stored data was for different drought setting)
    const needsRerun = hasData && persistedData.meta?.simulation_active !== isDroughtSim;

    const fetchAnalysisData = async () => {
        setLoading(true);
        setError(false);
        try {
            await fetchContinuousAnalytics({
                lat: analysis.lat,
                lon: analysis.lon,
                species,
                simulateDrought: isDroughtSim,
                analysisId: analysis._id
            });
        } catch (err) {
            console.error("API Fetch Error:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    // Show run button if no data yet, or if mode changed
    if (!hasData || needsRerun) {
        return (
            <Card className="border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-gray-900">{analysis.site_name || "Restoration Site"}</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">📍 {analysis.lat.toFixed(4)}, {analysis.lon.toFixed(4)}</span>
                        </div>
                    </div>
                    <Button
                        onClick={fetchAnalysisData}
                        disabled={loading}
                        className={isDroughtSim ? "bg-orange-600 hover:bg-orange-700" : "bg-emerald-600 hover:bg-emerald-700"}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Loading...
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 mr-2" />
                                {needsRerun ? (isDroughtSim ? "Run Drought Sim" : "Run Normal Analysis") : (isDroughtSim ? "Run Drought Sim" : "Run Analysis")}
                            </>
                        )}
                    </Button>
                </div>
                <CardContent className="p-12 text-center">
                    <div className="text-gray-300 text-4xl mb-3">
                        {isDroughtSim ? "🏜️" : "🛰️"}
                    </div>
                    <p className="text-gray-500 font-medium">
                        {needsRerun
                            ? `Switch to ${isDroughtSim ? "drought simulation" : "normal analysis"} mode`
                            : `Ready to ${isDroughtSim ? "simulate" : "analyze"}`}
                    </p>
                    <p className="text-sm text-gray-400">
                        {needsRerun ? "Click to fetch data for the new mode" : "Click the run button to fetch data"}
                    </p>
                </CardContent>
            </Card>
        )
    }

    if (loading) {
        return (
            <Card className="border-gray-100 shadow-sm animate-pulse">
                <CardContent className="p-6 h-[400px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className={`h-8 w-8 rounded-full border-2 border-t-transparent animate-spin ${isDroughtSim ? 'border-orange-500' : 'border-emerald-500'}`} />
                        <span className="text-sm text-gray-400">
                            {isDroughtSim ? "Simulating drought conditions..." : "Fetching satellite data..."}
                        </span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border-red-100 shadow-sm bg-red-50/10">
                <CardContent className="p-6 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-500 font-medium">Failed to load data</p>
                        <Button variant="outline" size="sm" onClick={fetchAnalysisData} className="mt-4 border-red-200 text-red-700 hover:bg-red-50">
                            <RotateCcw className="w-4 h-4 mr-2" /> Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Use persisted data from the analysis
    const data = persistedData;

    // Transform API graph data
    const chartData = data.widget_growth_curve?.x_axis_labels.map((label: string, idx: number) => ({
        year: label,
        value: data.widget_growth_curve.y_axis_data[idx]
    })) || [];

    const health = data.widget_health_badge;
    const audit = data.widget_audit_stamp;
    const growth = data.widget_growth_curve;

    return (
        <Card className="border-gray-200 shadow-sm overflow-hidden">
            {/* Card Header for Site Info */}
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-gray-900">{analysis.site_name || "Restoration Site"}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">📍 {analysis.lat.toFixed(4)}, {analysis.lon.toFixed(4)}</span>
                        <span className="flex items-center gap-1">🌿 {species}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={fetchAnalysisData}
                        className="text-gray-500 hover:text-gray-900"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <CardContent className="p-6 space-y-6">
                {/* Top Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Health Status */}
                    <div className={`rounded-xl p-4 border ${health?.ui_color === 'yellow' ? 'bg-yellow-50/50 border-yellow-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Health Status
                            </span>
                            <Badge className={`${health?.ui_color === 'yellow' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
                                {health?.status}
                            </Badge>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-gray-900">
                                {health?.current_ndvi_value}
                            </span>
                            <span className="text-sm text-gray-500 font-medium">NDVI</span>
                        </div>
                        <div className={`mt-2 text-xs font-medium inline-block px-2 py-1 rounded border ${health.density_gain.startsWith('-') ? 'text-red-600 bg-red-50 border-red-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>
                            {health?.density_gain} Density Gain
                        </div>
                    </div>

                    {/* Carbon Potential */}
                    <div className="rounded-xl p-4 border border-emerald-100 bg-emerald-50/30">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Total Potential
                            </span>
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200">
                                {growth?.title?.includes("Forecast") ? "Forecast" : "Projected"}
                            </Badge>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-gray-900">
                                {growth?.total_potential}
                            </span>
                        </div>
                        <div className="mt-2 text-xs text-emerald-700 font-medium bg-emerald-100/50 inline-block px-2 py-1 rounded border border-emerald-200">
                            +{audit?.productivity_factor}x Productivity Factor
                        </div>
                    </div>
                </div>

                {/* Main Chart */}
                <div>
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-900">
                            {growth?.title}
                        </h3>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id={`gradient-${analysis._id}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isDroughtSim ? "#f97316" : "#10b981"} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={isDroughtSim ? "#f97316" : "#10b981"} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="year"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 11 }}
                                    tickMargin={10}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 11 }}
                                    width={30}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        fontSize: '12px'
                                    }}
                                    itemStyle={{ color: isDroughtSim ? '#c2410c' : '#059669', fontWeight: 600 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={isDroughtSim ? "#f97316" : "#10b981"}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill={`url(#gradient-${analysis._id})`}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Audit Footer */}
                <div className="pt-4 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <span>Verified by <strong className="text-gray-600">{audit?.verified_by}</strong></span>
                        </div>
                        <div className="flex gap-4">
                            <span>Dataset: {audit?.dataset}</span>
                            <span>k: {audit?.growth_velocity_k}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
