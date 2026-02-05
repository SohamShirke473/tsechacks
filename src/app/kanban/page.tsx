"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, LayoutPanelLeft, Trash2, ArrowLeft, Loader2, X, GripVertical, CheckCircle2 } from "lucide-react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import KanbanBoard from "@/components/KanbanBoard";


// ============================================================
// TYPES
// ============================================================

interface Task {
    _id: Id<"kanbanTasks">;
    columnId: Id<"kanbanColumns">;
    title: string;
    description?: string;
    priority?: string;
    order: number;
    aiGenerated?: boolean;
}

interface Column {
    _id: Id<"kanbanColumns">;
    boardId: Id<"kanbanBoards">;
    title: string;
    order: number;
    tasks: Task[];
}

interface Board {
    _id: Id<"kanbanBoards">;
    name: string;
    description?: string;
    columns: Column[];
}

// ============================================================
// TASK CARD
// ============================================================

function TaskCard({ task, onDelete }: { task: Task; onDelete: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const priorityColors: Record<string, string> = {
        high: "bg-red-100 text-red-700 border-red-200",
        medium: "bg-amber-100 text-amber-700 border-amber-200",
        low: "bg-green-100 text-green-700 border-green-200",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group relative bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200"
        >
            <div className="flex items-start gap-3">
                <button
                    {...attributes}
                    {...listeners}
                    className="mt-0.5 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                >
                    <GripVertical className="w-4 h-4" />
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-gray-900 text-sm leading-tight">
                            {task.title}
                            {task.aiGenerated && (
                                <Sparkles className="inline-block ml-1.5 w-3.5 h-3.5 text-purple-500" />
                            )}
                        </h4>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    {task.description && (
                        <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
                            {task.description}
                        </p>
                    )}
                    {task.priority && (
                        <Badge
                            variant="outline"
                            className={`mt-2 text-xs ${priorityColors[task.priority] || ""}`}
                        >
                            {task.priority}
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================================
// PROJECT SELECTOR
// ============================================================

function ProjectSelector({
    selectedProjectId,
    onSelect,
}: {
    selectedProjectId: Id<"projects"> | null;
    onSelect: (id: Id<"projects">) => void;
}) {
    const projects = useQuery(api.projects.getProjects);

    if (projects === undefined) {
        return <Loader2 className="w-4 h-4 animate-spin" />;
    }

    if (projects.length === 0) {
        return (
            <p className="text-sm text-gray-500">No projects available. Create one first.</p>
        );
    }

    return (
        <select
            value={selectedProjectId || ""}
            onChange={(e) => onSelect(e.target.value as Id<"projects">)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
            <option value="">Select a project...</option>
            {projects.map((project) => (
                <option key={project._id} value={project._id}>
                    {project.name}
                </option>
            ))}
        </select>
    );
}

// ============================================================
// KANBAN TODO BOARD
// ============================================================

function KanbanTodoBoard({
    boardId,
    projectId,
}: {
    boardId: Id<"kanbanBoards">;
    projectId: Id<"projects">;
}) {
    const board = useQuery(api.kanban.getBoard, { boardId });
    const deleteTask = useMutation(api.kanban.deleteTask);
    const moveTask = useMutation(api.kanban.moveTask);
    const generateFromAnalytics = useAction(api.aiTasks.generateTasksFromAnalytics);

    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleGenerateFromAnalytics = async () => {
        if (!board?.columns[0]) return;

        setIsGenerating(true);
        try {
            await generateFromAnalytics({
                projectId,
                columnId: board.columns[0]._id,
            });
        } catch (error) {
            console.error("Failed to generate tasks:", error);
            alert("Failed to generate tasks. Make sure your project has analytics data.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const column = board?.columns[0];
        const task = column?.tasks.find((t) => t._id === event.active.id);
        if (task) setActiveTask(task);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);
        if (!over || active.id === over.id || !board?.columns[0]) return;

        const column = board.columns[0];
        const overIndex = column.tasks.findIndex((t) => t._id === over.id);

        await moveTask({
            taskId: active.id as Id<"kanbanTasks">,
            targetColumnId: column._id,
            newOrder: overIndex >= 0 ? overIndex : column.tasks.length,
        });
    };

    if (!board) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    const column = board.columns[0];
    const tasks = column?.tasks || [];

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-slate-900 rounded-sm" />
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">To Do</h2>
                        <p className="text-sm text-slate-500">
                            {tasks.length} task{tasks.length !== 1 ? "s" : ""} generated from analytics
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleGenerateFromAnalytics}
                    disabled={isGenerating}
                    className="bg-purple-600 hover:bg-purple-700"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate from Analytics
                        </>
                    )}
                </Button>
            </div>

            {/* Task List */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={tasks.map((t) => t._id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        {tasks.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <CheckCircle2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No tasks yet</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Click "Generate from Analytics" to create tasks based on your project data
                                </p>
                            </div>
                        ) : (
                            tasks.map((task) => (
                                <TaskCard
                                    key={task._id}
                                    task={task}
                                    onDelete={() => deleteTask({ taskId: task._id })}
                                />
                            ))
                        )}
                    </div>
                </SortableContext>

                <DragOverlay>
                    {activeTask ? (
                        <div className="bg-white rounded-lg border-2 border-primary p-4 shadow-xl rotate-2 opacity-95">
                            <h4 className="font-medium text-gray-900 text-sm">
                                {activeTask.title}
                            </h4>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

// ============================================================
// CREATE BOARD FOR PROJECT MODAL
// ============================================================

function CreateBoardModal({
    isOpen,
    onClose,
    onCreate,
}: {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (projectId: Id<"projects">) => Promise<void>;
}) {
    const [selectedProjectId, setSelectedProjectId] = useState<Id<"projects"> | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedProjectId) {
            setIsCreating(true);
            await onCreate(selectedProjectId);
            setSelectedProjectId(null);
            setIsCreating(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        Create Action Plan

                    </CardTitle>
                    <CardDescription>
                        Select a project to generate tasks from its analytics data
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Project
                            </label>
                            <ProjectSelector
                                selectedProjectId={selectedProjectId}
                                onSelect={setSelectedProjectId}
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isCreating}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!selectedProjectId || isCreating}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {isCreating ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Sparkles className="w-4 h-4 mr-2" />
                                )}
                                Create Plan
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

// ============================================================
// BOARD SELECTOR
// ============================================================

function BoardSelector({
    onSelectBoard,
}: {
    onSelectBoard: (boardId: Id<"kanbanBoards">, projectId: Id<"projects">) => void;
}) {
    const boards = useQuery(api.kanban.getBoards);
    const projects = useQuery(api.projects.getProjects);
    const createBoard = useMutation(api.kanban.createBoard);
    const deleteBoard = useMutation(api.kanban.deleteBoard);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const handleCreate = async (projectId: Id<"projects">) => {
        const project = projects?.find((p) => p._id === projectId);
        const boardId = await createBoard({
            name: project?.name ? `${project.name} Strategic Plan` : "Strategic Plan",
            description: `Tasks generated from ${project?.name || "project"} analytics`,
        });
        onSelectBoard(boardId, projectId);
    };

    const handleDelete = async (e: React.MouseEvent, boardId: Id<"kanbanBoards">) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this board?")) {
            await deleteBoard({ boardId });
        }
    };

    if (boards === undefined) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">AI-Powered</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Action Planning

                </h1>
                <p className="text-gray-600">
                    Generate actionable tasks from your project's risk and analytics data
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Create New Board Card */}
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="group h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200"
                >
                    <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                        <Sparkles className="w-6 h-6 text-gray-400 group-hover:text-purple-600" />
                    </div>
                    <span className="font-medium text-slate-600 group-hover:text-blue-700">
                        New Strategic Plan
                    </span>
                </button>

                {/* Existing Boards */}
                {boards.map((board) => (
                    <Card
                        key={board._id}
                        className="h-48 cursor-pointer hover:shadow-lg hover:border-purple-300 transition-all duration-200 group"
                        onClick={() => {
                            // Default to first project if we don't have the mapping stored
                            const firstProject = projects?.[0];
                            if (firstProject) {
                                onSelectBoard(board._id, firstProject._id);
                            }
                        }}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    {board.name}
                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                </CardTitle>
                                <button
                                    onClick={(e) => handleDelete(e, board._id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            {board.description && (
                                <CardDescription className="line-clamp-2">
                                    {board.description}
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <LayoutPanelLeft className="w-4 h-4" />
                                <span>
                                    Created {new Date(board.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <Badge variant="outline" className="mt-3 bg-blue-50 text-blue-600 border-blue-200">
                                To Do
                            </Badge>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <CreateBoardModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreate}
            />
        </div>
    );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

export default function KanbanPage() {
    const [selectedBoardId, setSelectedBoardId] = useState<Id<"kanbanBoards"> | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<Id<"projects"> | null>(null);
    const board = useQuery(
        api.kanban.getBoard,
        selectedBoardId ? { boardId: selectedBoardId } : "skip"
    );

    const handleSelectBoard = (boardId: Id<"kanbanBoards">, projectId: Id<"projects">) => {
        setSelectedBoardId(boardId);
        setSelectedProjectId(projectId);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <main className="flex-1 container mx-auto px-4 py-8">
                {selectedBoardId && selectedProjectId ? (
                    <div>
                        {/* Board Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSelectedBoardId(null);
                                    setSelectedProjectId(null);
                                }}
                                className="text-gray-600"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {board?.name || "Loading..."}
                                </h1>
                                {board?.description && (
                                    <p className="text-gray-600 text-sm">{board.description}</p>
                                )}
                            </div>

                        </div>

                        {/* Kanban Todo Board */}
                        {/* Kanban Todo Board */}
                        {/* Kanban Todo Board */}
                        <KanbanBoard boardId={selectedBoardId} projectId={selectedProjectId} />

                    </div>
                ) : (
                    <BoardSelector onSelectBoard={handleSelectBoard} />
                )}
            </main>
        </div>
    );
}
