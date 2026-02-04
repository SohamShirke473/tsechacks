"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import ProjectList from "@/components/ProjectList";
import RiskAnalyticsPanel from "@/components/RiskAnalyticsPanel";
import ContinuousAnalyticsPanel from "@/components/ContinuousAnalyticsPanel";
import ExplainByAI from "@/components/ExplainByAI";
import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";

export default function DashboardPage() {
    const [selectedProjectId, setSelectedProjectId] = useState<Id<"projects"> | null>(null);
    const [viewMode, setViewMode] = useState<'risk' | 'continuous'>('risk');
    const [isDroughtSim, setIsDroughtSim] = useState(false);
    const projects = useQuery(api.projects.getProjects);

    // Get selected project name for AI explanation
    const selectedProject = projects?.find(p => p._id === selectedProjectId);

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-[1800px] mx-auto space-y-6">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            Project Dashboard
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Monitor project analytics and risk predictions
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Drought Simulation Toggle - Only visible in continuous mode */}
                        {viewMode === 'continuous' && (
                            <button
                                onClick={() => setIsDroughtSim(!isDroughtSim)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border shadow-sm ${isDroughtSim
                                    ? 'bg-orange-50 border-orange-200 text-orange-700'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-base">{isDroughtSim ? '🏜️' : '💧'}</span>
                                <span>{isDroughtSim ? 'Drought Sim ON' : 'Drought Sim OFF'}</span>
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${isDroughtSim ? 'bg-orange-500' : 'bg-gray-300'}`}>
                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${isDroughtSim ? 'left-5' : 'left-0.5'}`} />
                                </div>
                            </button>
                        )}

                        {/* AI Explain Button */}
                        <ExplainByAI
                            projectId={selectedProjectId}
                            projectName={selectedProject?.name}
                        />

                        {/* View Mode Toggle */}
                        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
                            <button
                                onClick={() => setViewMode('risk')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'risk'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Risk Analytics
                            </button>
                            <button
                                onClick={() => setViewMode('continuous')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'continuous'
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Continuous Analysis
                            </button>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100vh-200px)]">
                    {/* Project List - 1/3 width */}
                    <div className="lg:col-span-1">
                        <ProjectList
                            projects={projects || []}
                            selectedProjectId={selectedProjectId}
                            onSelectProject={setSelectedProjectId}
                        />
                    </div>

                    {/* Analytics Panel - 2/3 width */}
                    <div className="lg:col-span-2">
                        {viewMode === 'risk' ? (
                            <RiskAnalyticsPanel selectedProjectId={selectedProjectId} />
                        ) : (
                            <ContinuousAnalyticsPanel
                                selectedProjectId={selectedProjectId}
                                isDroughtSim={isDroughtSim}
                            />
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
