"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Sparkles, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExplainByAIProps {
    projectId: Id<"projects"> | null;
    projectName?: string;
}

export default function ExplainByAI({ projectId, projectName }: ExplainByAIProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const explainAnalytics = useAction(api.gemini.explainAnalytics);

    const handleExplain = async () => {
        if (!projectId) return;

        setIsOpen(true);
        setLoading(true);
        setError(null);
        setExplanation(null);

        try {
            const result = await explainAnalytics({ projectId });
            setExplanation(result.explanation);
        } catch (err) {
            console.error("AI Explanation error:", err);
            setError(err instanceof Error ? err.message : "Failed to generate explanation");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setExplanation(null);
        setError(null);
    };

    // Simple markdown-like rendering without external dependencies
    const renderExplanation = (text: string) => {
        const lines = text.split('\n');
        return lines.map((line, index) => {
            // Headers
            if (line.startsWith('### ')) {
                return <h3 key={index} className="text-lg font-semibold text-gray-700 mt-4 mb-2">{line.slice(4)}</h3>;
            }
            if (line.startsWith('## ')) {
                return <h2 key={index} className="text-xl font-bold text-gray-800 mt-6 mb-3">{line.slice(3)}</h2>;
            }
            if (line.startsWith('# ')) {
                return <h1 key={index} className="text-2xl font-bold text-gray-900 mb-4">{line.slice(2)}</h1>;
            }
            // Bullet points
            if (line.startsWith('- ') || line.startsWith('* ')) {
                return (
                    <li key={index} className="ml-4 text-gray-600 mb-1 list-disc list-inside">
                        {renderInlineFormatting(line.slice(2))}
                    </li>
                );
            }
            // Numbered lists
            if (/^\d+\.\s/.test(line)) {
                return (
                    <li key={index} className="ml-4 text-gray-600 mb-1 list-decimal list-inside">
                        {renderInlineFormatting(line.replace(/^\d+\.\s/, ''))}
                    </li>
                );
            }
            // Empty lines
            if (line.trim() === '') {
                return <div key={index} className="h-2" />;
            }
            // Regular paragraphs
            return <p key={index} className="text-gray-600 mb-2 leading-relaxed">{renderInlineFormatting(line)}</p>;
        });
    };

    // Handle bold and inline code
    const renderInlineFormatting = (text: string) => {
        // Split by bold markers and inline code
        const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-semibold text-gray-800">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return <code key={i} className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono">{part.slice(1, -1)}</code>;
            }
            return part;
        });
    };

    return (
        <>
            {/* Trigger Button */}
            <Button
                onClick={handleExplain}
                disabled={!projectId}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Sparkles className="w-4 h-4 mr-2" />
                Explain by AI
            </Button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] mx-4 overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-indigo-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">AI Analysis</h2>
                                    <p className="text-sm text-gray-500">
                                        {projectName || "Project"} insights powered by Gemini
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {loading && (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 animate-pulse" />
                                        <Loader2 className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" />
                                    </div>
                                    <p className="mt-4 text-gray-600 font-medium">Analyzing project data...</p>
                                    <p className="text-sm text-gray-400">This may take a few seconds</p>
                                </div>
                            )}

                            {error && (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                        <AlertCircle className="w-8 h-8 text-red-500" />
                                    </div>
                                    <p className="text-red-600 font-medium mb-2">Analysis Failed</p>
                                    <p className="text-sm text-gray-500 text-center max-w-md">{error}</p>
                                    <Button
                                        onClick={handleExplain}
                                        variant="outline"
                                        className="mt-4 border-red-200 text-red-700 hover:bg-red-50"
                                    >
                                        Try Again
                                    </Button>
                                </div>
                            )}

                            {explanation && (
                                <div className="prose prose-gray max-w-none">
                                    {renderExplanation(explanation)}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {explanation && (
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                                <p className="text-xs text-gray-400 text-center">
                                    Generated by Gemini AI • Analysis based on available project data
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
