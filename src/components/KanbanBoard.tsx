"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    type DragOverEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Sparkles, Trash2, GripVertical, X, Loader2 } from "lucide-react";

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
// KANBAN CARD COMPONENT
// ============================================================

function KanbanCard({ task, onDelete }: { task: Task; onDelete: () => void }) {
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
            className="group relative bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing"
        >
            <div className="flex items-start gap-2">
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
                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">
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
// KANBAN COLUMN COMPONENT
// ============================================================

function KanbanColumn({
    column,
    onAddTask,
    onDeleteTask,
    onGenerateAI,
    isGenerating,
}: {
    column: Column;
    onAddTask: (columnId: Id<"kanbanColumns">) => void;
    onDeleteTask: (taskId: Id<"kanbanTasks">) => void;
    onGenerateAI: (columnId: Id<"kanbanColumns">) => void;
    isGenerating: boolean;
}) {
    const taskIds = column.tasks.map((t) => t._id);

    const columnColors: Record<string, string> = {
        "To Do": "border-t-blue-500",
        "In Progress": "border-t-amber-500",
        "Done": "border-t-green-500",
    };

    return (
        <div
            className={`flex-shrink-0 w-80 bg-gray-50 rounded-xl border border-gray-200 border-t-4 ${columnColors[column.title] || "border-t-gray-400"}`}
        >
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">{column.title}</h3>
                    <Badge variant="secondary" className="font-mono">
                        {column.tasks.length}
                    </Badge>
                </div>
            </div>

            <div className="p-3 min-h-[200px]">
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                        {column.tasks.map((task) => (
                            <KanbanCard
                                key={task._id}
                                task={task}
                                onDelete={() => onDeleteTask(task._id)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </div>

            <div className="p-3 border-t border-gray-200 space-y-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddTask(column._id)}
                    className="w-full justify-start text-gray-600 hover:text-gray-900"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add task
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onGenerateAI(column._id)}
                    disabled={isGenerating}
                    className="w-full justify-start text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
                >
                    {isGenerating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Generate with AI
                </Button>
            </div>
        </div>
    );
}

// ============================================================
// AI TASK GENERATOR MODAL
// ============================================================

function AITaskGeneratorModal({
    isOpen,
    onClose,
    onGenerate,
    isLoading,
}: {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (prompt: string) => void;
    isLoading: boolean;
}) {
    const [prompt, setPrompt] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onGenerate(prompt.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        Generate Tasks with AI
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                What tasks do you need?
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., Tasks for building a user authentication system..."
                                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!prompt.trim() || isLoading}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Generate Tasks
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

// ============================================================
// ADD TASK MODAL
// ============================================================

function AddTaskModal({
    isOpen,
    onClose,
    onAdd,
}: {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (title: string, description: string, priority: string) => void;
}) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("medium");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onAdd(title.trim(), description.trim(), priority);
            setTitle("");
            setDescription("");
            setPriority("medium");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                <CardHeader>
                    <CardTitle>Add New Task</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter task title..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description (optional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add a description..."
                                className="w-full min-h-[80px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Priority
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!title.trim()}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Task
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

// ============================================================
// MAIN KANBAN BOARD COMPONENT
// ============================================================

export default function KanbanBoard({ boardId }: { boardId: Id<"kanbanBoards"> }) {
    const board = useQuery(api.kanban.getBoard, { boardId });
    const moveTask = useMutation(api.kanban.moveTask);
    const createTask = useMutation(api.kanban.createTask);
    const deleteTask = useMutation(api.kanban.deleteTask);
    const generateTasks = useAction(api.aiTasks.generateTasks);

    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [addTaskColumnId, setAddTaskColumnId] = useState<Id<"kanbanColumns"> | null>(null);
    const [aiModalColumnId, setAiModalColumnId] = useState<Id<"kanbanColumns"> | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const findTask = (id: string): Task | undefined => {
        for (const column of board?.columns || []) {
            const task = column.tasks.find((t) => t._id === id);
            if (task) return task;
        }
        return undefined;
    };

    const findColumnByTaskId = (taskId: string): Column | undefined => {
        for (const column of board?.columns || []) {
            if (column.tasks.some((t) => t._id === taskId)) {
                return column;
            }
        }
        return undefined;
    };

    const handleDragStart = (event: DragStartEvent) => {
        const task = findTask(event.active.id as string);
        if (task) {
            setActiveTask(task);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId === overId) return;

        const activeTask = findTask(activeId);
        if (!activeTask) return;

        // Find target column - could be dropping on a column or a task
        let targetColumn = board?.columns.find((c) => c._id === overId);
        let newOrder = 0;

        if (!targetColumn) {
            // Dropping on a task, find its column
            targetColumn = findColumnByTaskId(overId) as any;
            if (targetColumn) {
                const overTaskIndex = targetColumn.tasks.findIndex((t) => t._id === overId);
                newOrder = overTaskIndex >= 0 ? overTaskIndex : targetColumn.tasks.length;
            }
        } else {
            // Dropping on empty column area
            newOrder = targetColumn.tasks.length;
        }

        if (targetColumn) {
            await moveTask({
                taskId: activeTask._id,
                targetColumnId: targetColumn._id,
                newOrder,
            });
        }
    };

    const handleAddTask = async (title: string, description: string, priority: string) => {
        if (addTaskColumnId) {
            await createTask({
                columnId: addTaskColumnId,
                title,
                description: description || undefined,
                priority,
            });
        }
    };

    const handleDeleteTask = async (taskId: Id<"kanbanTasks">) => {
        await deleteTask({ taskId });
    };

    const handleGenerateAI = async (prompt: string) => {
        if (!aiModalColumnId) return;

        setIsGenerating(true);
        try {
            await generateTasks({
                columnId: aiModalColumnId,
                context: prompt,
            });
            setAiModalColumnId(null);
        } catch (error) {
            console.error("Failed to generate tasks:", error);
            alert("Failed to generate tasks. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (!board) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="h-full">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-4 px-1">
                    {board.columns.map((column) => (
                        <KanbanColumn
                            key={column._id}
                            column={column}
                            onAddTask={setAddTaskColumnId}
                            onDeleteTask={handleDeleteTask}
                            onGenerateAI={setAiModalColumnId}
                            isGenerating={isGenerating && aiModalColumnId === column._id}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <div className="bg-white rounded-lg border-2 border-primary p-3 shadow-xl rotate-3 opacity-90">
                            <h4 className="font-medium text-gray-900 text-sm">
                                {activeTask.title}
                            </h4>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <AddTaskModal
                isOpen={addTaskColumnId !== null}
                onClose={() => setAddTaskColumnId(null)}
                onAdd={handleAddTask}
            />

            <AITaskGeneratorModal
                isOpen={aiModalColumnId !== null}
                onClose={() => setAiModalColumnId(null)}
                onGenerate={handleGenerateAI}
                isLoading={isGenerating}
            />
        </div>
    );
}
