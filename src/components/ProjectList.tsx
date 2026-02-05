"use client";

import type { Id } from "../../convex/_generated/dataModel";

interface Project {
    _id: Id<"projects">;
    _creationTime: number;
    name: string;
    description: string;
    status: string;
    creationTime: number;
}

interface ProjectListProps {
    projects: Project[];
    selectedProjectId: Id<"projects"> | null;
    onSelectProject: (id: Id<"projects">) => void;
}

export default function ProjectList({ projects, selectedProjectId, onSelectProject }: ProjectListProps) {
    if (!projects || projects.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="text-slate-300 text-5xl">📁</div>
                    <p className="text-slate-500 font-medium">No projects yet</p>
                    <p className="text-slate-400 text-sm">Create a project to get started</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 h-full overflow-hidden flex flex-col">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Projects</h2>
                <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{projects.length} Total</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {projects.map((project) => {
                    const isSelected = selectedProjectId === project._id;
                    return (
                        <button
                            key={project._id}
                            onClick={() => onSelectProject(project._id)}
                            type="button"
                            className={`w-full text-left p-4 rounded-md border transition-all duration-200 group ${isSelected
                                ? "border-blue-700 bg-blue-50 shadow-sm"
                                : "border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50 hover:shadow-sm"
                                }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-semibold truncate text-sm mb-1 ${isSelected ? "text-blue-900" : "text-slate-900"
                                        }`}>
                                        {project.name}
                                    </h3>
                                    <p className={`text-xs line-clamp-2 ${isSelected ? "text-blue-800/80" : "text-slate-500"
                                        }`}>
                                        {project.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${project.status === "Active"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : "bg-slate-100 text-slate-700 border-slate-200"
                                            }`}>
                                            {project.status}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(project.creationTime).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                {isSelected && (
                                    <div className="shrink-0">
                                        <div className="w-1.5 h-1.5 bg-blue-700 rounded-full" />
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
