"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import ProjectList from "@/components/ProjectList";
import RiskAnalyticsPanel from "@/components/RiskAnalyticsPanel";
import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";

export default function DashboardPage() {
    const [selectedProjectId, setSelectedProjectId] = useState<Id<"projects"> | null>(null);
    const projects = useQuery(api.projects.getProjects);

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-[1800px] mx-auto space-y-6">
                <header className="space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Project Dashboard
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Monitor project analytics and risk predictions
                    </p>
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
                        <RiskAnalyticsPanel selectedProjectId={selectedProjectId} />
                    </div>
                </div>
            </div>
        </main>
    );
}
