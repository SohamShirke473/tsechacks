"use client";

import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import dynamic from "next/dynamic";
import { Loader2, Sprout, Droplets, Thermometer, Wind, Save, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateProjectModal } from "./CreateProjectModal";
import { SuitabilityLegend } from "./SuitabilityLegend";
// import { toast } from "sonner"; // Removed dependency

// Dynamically import map with NO SSR
const LeafletMap = dynamic(() => import("./LeafletMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-400">Loading Map...</div>
});

export default function SmartSoilDashboard() {
    const performAnalysis = useAction(api.actions.analyzeSite);
    const createProject = useMutation(api.projects.createProject);
    const addToProject = useMutation(api.projects.addToProject);

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null); // Type this properly based on API return
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(true);

    const handleAnalyze = async () => {
        if (!location) return;
        setLoading(true);
        try {
            const data = await performAnalysis({ lat: location.lat, lon: location.lng });
            setResult(data);
        } catch (error) {
            console.error("Analysis failed:", error);
            alert("Failed to analyze site. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToProject = async (data: {
        projectId?: string;
        name?: string;
        description?: string;
        selectedPlants?: string[];
    }) => {
        if (!result || !result.analysisId) return;
        setIsCreatingProject(true);
        try {
            let targetProjectId = data.projectId;

            // If creating new project
            if (!targetProjectId && data.name) {
                targetProjectId = await createProject({
                    name: data.name,
                    description: data.description || "",
                });
            }

            if (targetProjectId) {
                // Add Analysis to Project with selected plants
                await addToProject({
                    projectId: targetProjectId as any,
                    analysisId: result.analysisId,
                    selectedPlants: data.selectedPlants
                });

                setIsProjectModalOpen(false);
                alert("Saved to project successfully!");
            }
        } catch (error) {
            console.error("Failed to save to project:", error);
            alert("Failed to save to project.");
        } finally {
            setIsCreatingProject(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-100px)]">
            {/* Left Panel: Map & Input */}
            <Card className="flex flex-col overflow-hidden border-2 border-emerald-100 shadow-lg">
                <CardHeader className="bg-emerald-50/50 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-emerald-800 flex items-center gap-2">
                                <Sprout className="w-5 h-5" />
                                Select Site
                            </CardTitle>
                            <p className="text-sm text-emerald-600/80 mt-1">Click on the map to pinpoint your restoration site.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {showHeatmap && <SuitabilityLegend />}
                            <button
                                onClick={() => setShowHeatmap(!showHeatmap)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow transition-all duration-200 ${showHeatmap
                                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                    }`}
                                title={showHeatmap ? "Hide Suitability Layer" : "Show Suitability Layer"}
                            >
                                <Layers className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    {showHeatmap ? "Hide" : "Show"} Layer
                                </span>
                            </button>
                        </div>
                    </div>
                </CardHeader>
                <div className="flex-1 relative z-0 min-h-[400px]">
                    <LeafletMap
                        onLocationSelect={(lat, lng) => setLocation({ lat, lng })}
                        showHeatmap={showHeatmap}
                    />

                    {location && (
                        <div className="absolute bottom-6 left-6 right-6 z-400">
                            <Card className="bg-white/90 backdrop-blur shadow-xl border-emerald-200">
                                <div className="p-4 flex items-center justify-between">
                                    <div className="text-sm">
                                        <div className="font-semibold text-gray-700">
                                            {result?.siteAnalysis?.site_name || "Selected Location"}
                                        </div>
                                        <div className="font-mono text-xs text-gray-500">
                                            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {result && (
                                            <Button
                                                onClick={() => setIsProjectModalOpen(true)}
                                                variant="outline"
                                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Project
                                            </Button>
                                        )}
                                        <Button
                                            onClick={handleAnalyze}
                                            disabled={loading}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 shadow-lg"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Analyzing...
                                                </>
                                            ) : (
                                                "Run Analysis"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </Card>

            {/* Right Panel: Results */}
            <div className="overflow-y-auto pr-2 space-y-6">
                {!result ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                            <Sprout className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-sm font-medium">No analysis data yet.</p>
                        <p className="text-xs">Select a location and run analysis to see insights.</p>
                    </div>
                ) : (
                    <>
                        {/* Priority Status Banner */}
                        {result.siteAnalysis && result.siteAnalysis.ssi_score !== undefined && (
                            <div className={`rounded-lg p-4 mb-2 flex items-center gap-3 ${result.siteAnalysis.ssi_score > 0.75
                                    ? "bg-emerald-50 border border-emerald-200"
                                    : result.siteAnalysis.ssi_score > 0.50
                                        ? "bg-yellow-50 border border-yellow-200"
                                        : "bg-red-50 border border-red-200"
                                }`}>
                                <span className="text-2xl">
                                    {result.siteAnalysis.ssi_score > 0.75
                                        ? "🟢"
                                        : result.siteAnalysis.ssi_score > 0.50
                                            ? "🟡"
                                            : "🔴"}
                                </span>
                                <div>
                                    <div className={`font-bold ${result.siteAnalysis.ssi_score > 0.75
                                            ? "text-emerald-700"
                                            : result.siteAnalysis.ssi_score > 0.50
                                                ? "text-yellow-700"
                                                : "text-red-700"
                                        }`}>
                                        {result.siteAnalysis.ssi_score > 0.75
                                            ? "HIGH PRIORITY"
                                            : result.siteAnalysis.ssi_score > 0.50
                                                ? "SUITABLE"
                                                : "LOW PRIORITY"}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Site Suitability Index: <span className="font-mono font-semibold">{result.siteAnalysis.ssi_score.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Top Stats Row */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {result.siteAnalysis && result.siteAnalysis.ssi_score !== undefined && (
                                <StatCard
                                    label="Site SSI"
                                    value={result.siteAnalysis.ssi_score.toFixed(2)}
                                    sub={result.siteAnalysis.site_name || "Unknown Site"}
                                    icon={<Sprout className="w-4 h-4 text-purple-500" />}
                                    color="purple"
                                />
                            )}
                            <StatCard
                                label="Soil pH"
                                value={result.soil.ph.toFixed(1)}
                                sub={result.soil.ph < 5.5 ? "Acidic" : result.soil.ph > 7.5 ? "Alkaline" : "Neutral"}
                                icon={<Droplets className="w-4 h-4 text-blue-500" />}
                                color="blue"
                            />
                            <StatCard
                                label="Texture"
                                value={result.soil.classification}
                                sub={`${result.soil.texture.clay.toFixed(0)}% Clay`}
                                icon={<Sprout className="w-4 h-4 text-emerald-500" />}
                                color="emerald"
                            />
                            <StatCard
                                label="Temp"
                                value={`${result.weather.temp.toFixed(1)}°C`}
                                sub={result.weather.description}
                                icon={<Thermometer className="w-4 h-4 text-orange-500" />}
                                color="orange"
                            />
                        </div>

                        {/* Recommendations List */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                Top Recommendations
                                <Badge variant="outline" className="ml-auto border-emerald-200 text-emerald-700 bg-emerald-50">
                                    {result.results.length} Matches Found
                                </Badge>
                            </h3>
                            <div className="space-y-4">
                                {result.results.slice(0, 5).map((m: any, idx: number) => (
                                    <Card key={idx} className="group hover:border-emerald-300 transition-all duration-300">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                                                        {m.plant.name}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 line-clamp-1">{m.plant.description}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <Badge className={
                                                        m.result.suitability === 'Excellent' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                                                            m.result.suitability === 'Good' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                                                'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                    }>
                                                        {m.result.suitability}
                                                    </Badge>
                                                    <span className="text-[10px] font-mono text-gray-400">
                                                        {(m.result.score * 100).toFixed(0)}% Match
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Analysis Breakdown Mini-Bars */}
                                            <div className="grid grid-cols-3 gap-2 mt-3 mb-3">
                                                <ScoreBar label="pH" score={m.result.factors.phScore} />
                                                <ScoreBar label="Soil" score={m.result.factors.textureScore} />
                                                <ScoreBar label="Climate" score={m.result.factors.climateScore} />
                                            </div>

                                            {/* Warnings / Tips */}
                                            {m.result.recommendations.length > 0 && (
                                                <div className="bg-amber-50/50 border border-amber-100 rounded-md p-2 mt-2">
                                                    <ul className="list-disc list-inside text-xs text-amber-700 space-y-1">
                                                        {m.result.recommendations.map((r: string, i: number) => (
                                                            <li key={i}>{r}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <CreateProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                onSubmit={handleSaveToProject}
                isSubmitting={isCreatingProject}
                availablePlants={result?.results || []}
            />
        </div>
    );
}

function StatCard({ label, value, sub, icon, color }: any) {
    return (
        <Card className={`border-${color}-100 bg-${color}-50/30`}>
            <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1 text-gray-500 text-xs font-semibold uppercase">
                    {icon} {label}
                </div>
                <div className="text-lg font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500 truncate">{sub}</div>
            </CardContent>
        </Card>
    )
}

function ScoreBar({ label, score }: { label: string, score: number }) {
    const height = 4;
    return (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-gray-500">
                <span>{label}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${score > 0.8 ? 'bg-emerald-500' : score > 0.5 ? 'bg-yellow-500' : 'bg-red-400'
                        }`}
                    style={{ width: `${score * 100}%` }}
                />
            </div>
        </div>
    )
}
