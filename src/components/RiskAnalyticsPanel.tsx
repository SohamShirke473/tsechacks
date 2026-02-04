"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

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

    const getRiskColor = (risk: string) => {
        switch (risk.toUpperCase()) {
            case "LOW":
                return "bg-green-100 text-green-800 border-green-300";
            case "MEDIUM":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "HIGH":
                return "bg-orange-100 text-orange-800 border-orange-300";
            case "CRITICAL":
                return "bg-red-100 text-red-800 border-red-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    const getStatusColor = (status: string) => {
        if (status.includes("CRITICAL")) return "text-red-600";
        if (status.includes("WARNING")) return "text-orange-600";
        if (status.includes("GOOD")) return "text-green-600";
        return "text-gray-600";
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
                                {hasRiskData && analysis.riskPrediction && (
                                    <div className="space-y-4 mt-4">
                                        {/* Short-term Metrics */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <span>⚡</span>
                                                Short-term Risk Assessment
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Temperature Z-Score</p>
                                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                                        {analysis.riskPrediction.short_term.temp_z_score.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Rainfall Z-Score</p>
                                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                                        {analysis.riskPrediction.short_term.rain_z_score.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Humidity Z-Score</p>
                                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                                        {analysis.riskPrediction.short_term.humidity_z_score.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Disease Risk</p>
                                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border mt-1 ${getRiskColor(analysis.riskPrediction.short_term.disease_outbreak_risk)}`}>
                                                        {analysis.riskPrediction.short_term.disease_outbreak_risk}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Long-term Survival */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <span>📈</span>
                                                Long-term Survival Analysis
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">3-Year Survival Probability</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-32 bg-gray-200 rounded-full h-3 overflow-hidden">
                                                            <div
                                                                className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full transition-all"
                                                                style={{ width: `${analysis.riskPrediction.long_term.survival_probability_3yr * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="font-bold text-lg text-gray-900">
                                                            {(analysis.riskPrediction.long_term.survival_probability_3yr * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Primary Threat</span>
                                                    <span className="font-semibold text-orange-600">
                                                        {analysis.riskPrediction.long_term.primary_threat}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Status</span>
                                                    <span className={`font-bold text-lg ${getStatusColor(analysis.riskPrediction.long_term.status)}`}>
                                                        {analysis.riskPrediction.long_term.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Climatology */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <span>🌡️</span>
                                                Climate Profile
                                            </h4>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Annual Max</p>
                                                    <p className="text-lg font-bold text-red-600 mt-1">
                                                        {analysis.riskPrediction.long_term.climatology.annual_max}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Annual Min</p>
                                                    <p className="text-lg font-bold text-blue-600 mt-1">
                                                        {analysis.riskPrediction.long_term.climatology.annual_min}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Annual Rainfall</p>
                                                    <p className="text-lg font-bold text-cyan-600 mt-1">
                                                        {analysis.riskPrediction.long_term.climatology.annual_rainfall_mm} mm
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Biological Thresholds */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <span>🧬</span>
                                                Biological Thresholds
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Max Temperature</p>
                                                    <p className="text-lg font-semibold text-gray-900 mt-1">
                                                        {analysis.riskPrediction.biological_thresholds.max_temp}°C
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Min Temperature</p>
                                                    <p className="text-lg font-semibold text-gray-900 mt-1">
                                                        {analysis.riskPrediction.biological_thresholds.min_temp}°C
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Water Needs</p>
                                                    <p className="text-lg font-semibold text-gray-900 mt-1">
                                                        {analysis.riskPrediction.biological_thresholds.water_needs}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Vulnerability</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className="bg-gradient-to-r from-yellow-500 to-red-500 h-full rounded-full"
                                                                style={{ width: `${analysis.riskPrediction.biological_thresholds.vulnerability * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="font-semibold text-gray-900">
                                                            {(analysis.riskPrediction.biological_thresholds.vulnerability * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Metadata */}
                                        <div className="text-xs text-gray-400 pt-2 border-t border-gray-200">
                                            Last updated: {new Date(analysis.riskPrediction.metadata.timestamp).toLocaleString()}
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
