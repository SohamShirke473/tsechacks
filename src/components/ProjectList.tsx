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
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="text-gray-400 text-5xl">📁</div>
                    <p className="text-gray-500 font-medium">No projects yet</p>
                    <p className="text-gray-400 text-sm">Create a project to get started</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full overflow-hidden flex flex-col">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Projects</h2>
                <p className="text-sm text-gray-500 mt-1">{projects.length} total</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {projects.map((project) => {
                    const isSelected = selectedProjectId === project._id;
                    return (
                        <button
                            key={project._id}
                            onClick={() => onSelectProject(project._id)}
                            type="button"
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${isSelected
                                    ? "border-blue-500 bg-blue-50 shadow-md scale-[1.02]"
                                    : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                                }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-semibold truncate ${isSelected ? "text-blue-900" : "text-gray-900"
                                        }`}>
                                        {project.name}
                                    </h3>
                                    <p className={`text-sm mt-1 line-clamp-2 ${isSelected ? "text-blue-700" : "text-gray-600"
                                        }`}>
                                        {project.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${project.status === "Active"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-700"
                                            }`}>
                                            {project.status}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(project.creationTime).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                {isSelected && (
                                    <div className="flex-shrink-0">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
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
