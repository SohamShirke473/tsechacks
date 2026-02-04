import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, X, Plus, List, Leaf } from "lucide-react";

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Available plants from the analysis results
    availablePlants?: Array<any>; // Flexible type to handle nested structure
    // Callback: if returning valid ID -> existing project. If returning string -> new project name.
    onSubmit: (data: {
        projectId?: string;
        name?: string;
        description?: string;
        selectedPlants?: string[];
    }) => Promise<void>;
    isSubmitting: boolean;
}

export function CreateProjectModal({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
    availablePlants = []
}: CreateProjectModalProps) {
    const existingProjects = useQuery(api.projects.getProjects);

    // Mode: "new" or "existing"
    const [mode, setMode] = useState<"new" | "existing">("new");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [selectedPlants, setSelectedPlants] = useState<string[]>([]);

    // Reset form when opening
    useEffect(() => {
        if (isOpen) {
            setMode("new");
            setName("");
            setDescription("");
            setSelectedProjectId("");
            // Pre-select top 3 plants by default
            const topPlants = availablePlants.slice(0, 3).map(item =>
                item.plant?.name || item.plantName
            );
            setSelectedPlants(topPlants);
        }
    }, [isOpen, availablePlants]);

    const togglePlant = (plantName: string) => {
        setSelectedPlants(prev =>
            prev.includes(plantName)
                ? prev.filter(p => p !== plantName)
                : [...prev, plantName]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === "new") {
            if (!name.trim()) return;
            await onSubmit({ name, description, selectedPlants });
        } else {
            if (!selectedProjectId) return;
            await onSubmit({ projectId: selectedProjectId, selectedPlants });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Add to Project</h2>
                        <p className="text-sm text-gray-500">Save this analysis and select plants for your project.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1">
                    <div className="p-4 pb-0">
                        <div className="flex p-1 bg-gray-100 rounded-lg mb-4">
                            <button
                                onClick={() => setMode("new")}
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all ${mode === "new" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                <Plus className="w-4 h-4" />
                                New Project
                            </button>
                            <button
                                onClick={() => setMode("existing")}
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all ${mode === "existing" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                <List className="w-4 h-4" />
                                Existing
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 space-y-4 pt-0">
                        {mode === "new" ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Project Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Riverside Restoration Zone A"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required={mode === "new"}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Reason for Selection / Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Why did you choose this site? What are the key goals?"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="projectSelect">Select Project</Label>
                                {existingProjects ? (
                                    existingProjects.length > 0 ? (
                                        <select
                                            id="projectSelect"
                                            className="w-full p-2 border rounded-md bg-white text-sm"
                                            value={selectedProjectId}
                                            onChange={(e) => setSelectedProjectId(e.target.value)}
                                            required={mode === "existing"}
                                        >
                                            <option value="">-- Choose a Project --</option>
                                            {existingProjects.map((p: any) => (
                                                <option key={p._id} value={p._id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 rounded-md border border-dashed">
                                            No existing projects found. Create a new one!
                                        </div>
                                    )
                                ) : (
                                    <div className="p-2 text-sm text-gray-400">Loading projects...</div>
                                )}
                            </div>
                        )}

                        {/* Plant Selection */}
                        {availablePlants.length > 0 && (
                            <div className="space-y-2 border-t pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Leaf className="w-4 h-4 text-emerald-600" />
                                    <Label>Select Plants for this Project</Label>
                                    <span className="text-xs text-gray-500 ml-auto">
                                        {selectedPlants.length} selected
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto p-2 bg-gray-50 rounded-md border">
                                    {availablePlants.map((item, idx) => {
                                        const plantName = item.plant?.name || item.plantName;
                                        const score = item.result?.score || item.score || 0;
                                        const suitability = item.result?.suitability || item.suitability || 'Unknown';

                                        return (
                                            <label
                                                key={idx}
                                                className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${selectedPlants.includes(plantName)
                                                    ? "bg-emerald-50 border-emerald-300"
                                                    : "bg-white border-gray-200 hover:border-emerald-200"
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPlants.includes(plantName)}
                                                    onChange={() => togglePlant(plantName)}
                                                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm text-gray-900 truncate">
                                                        {plantName}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {suitability} • {(score * 100).toFixed(0)}% match
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    mode === "new" ? "Create & Add" : "Add to Project"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
