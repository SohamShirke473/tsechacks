import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Tag } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
interface Task {
    _id: string;
    title: string;
    description?: string;
    url?: string;
    tags?: string[];
    suggestedHeadings?: string[];
    priority?: string;
}

interface TaskDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
}

export function TaskDetailModal({ isOpen, onClose, task }: TaskDetailModalProps) {
    if (!task) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        {task.title}
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-6 py-4">
                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {task.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                        <Tag className="w-3 h-3 mr-1" />
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Description/Summary */}
                        {task.description && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-gray-900">Summary</h4>
                                <p className="text-gray-600 leading-relaxed">
                                    {task.description}
                                </p>
                            </div>
                        )}

                        {/* Suggested Headings */}
                        {task.suggestedHeadings && task.suggestedHeadings.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-gray-900">Suggested Headings</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    {task.suggestedHeadings.map((heading, index) => (
                                        <li key={index}>{heading}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Link */}
                        {task.url && (
                            <div className="pt-4 border-t">
                                <a
                                    href={task.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Read full article
                                    <ExternalLink className="w-4 h-4 ml-1.5" />
                                </a>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
