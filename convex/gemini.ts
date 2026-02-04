import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ============================================================
// PROMPT REGISTRY - Add new prompts here for different features
// ============================================================

type PromptType = "EXPLAIN_ANALYTICS" | "EXPLAIN_RISK" | "EXPLAIN_GROWTH" | "GENERATE_TASKS";

interface PromptConfig {
    systemInstruction: string;
    formatData: (data: any) => string;
}

const PROMPTS: Record<PromptType, PromptConfig> = {
    EXPLAIN_ANALYTICS: {
        systemInstruction: `You are a practical environmental analyst explaining project data to farmers and land managers.

RULES:
- Keep your response under 300 words
- Use simple, everyday language - no technical jargon
- Be direct: "This means..." or "You should..."
- Focus on what the numbers actually mean for the project
- Give 2-3 specific, practical actions they can take

Structure your response as:
1. Overall Status (1-2 sentences)
2. What the Data Shows (bullet points, plain language)
3. What to Do Next (2-3 concrete actions)`,
        formatData: (data: any) => {
            const { project, analyses } = data;
            let prompt = `Project: ${project.name}\n${project.description}\n\n`;
            prompt += `Here's the site data - explain what it means in plain terms:\n\n`;

            for (const analysis of analyses) {
                prompt += `Site: ${analysis.site_name || "Unnamed"} at ${analysis.lat.toFixed(2)}, ${analysis.lon.toFixed(2)}\n`;
                prompt += `Species planted: ${analysis.selectedPlants?.join(", ") || "Not specified"}\n`;
                prompt += `Site quality score: ${analysis.ssi_score?.toFixed(2) || "N/A"}/1.0\n`;

                if (analysis.riskPrediction) {
                    const risk = analysis.riskPrediction;
                    prompt += `\nRisk Data:\n`;
                    prompt += `- 3-year survival chance: ${(risk.long_term?.survival_probability_3yr * 100).toFixed(0)}%\n`;
                    prompt += `- Main threat: ${risk.long_term?.primary_threat}\n`;
                    prompt += `- Trend: ${risk.metadata?.trend_status}\n`;
                    prompt += `- Yearly rainfall: ${risk.long_term?.average_annual_rainfall}mm\n`;
                }

                if (analysis.continuousAnalytics) {
                    const ca = analysis.continuousAnalytics;
                    prompt += `\nGrowth Data:\n`;
                    prompt += `- Plant health: ${ca.widget_health_badge?.status}\n`;
                    prompt += `- Vegetation index (NDVI): ${ca.widget_health_badge?.current_ndvi_value}\n`;
                    prompt += `- Density change: ${ca.widget_health_badge?.density_gain}\n`;
                    prompt += `- Carbon capture potential: ${ca.widget_growth_curve?.total_potential}\n`;
                    prompt += `- Growth rate multiplier: ${ca.widget_audit_stamp?.productivity_factor}x\n`;
                    if (ca.meta?.simulation_active) {
                        prompt += `- NOTE: Drought simulation is ON\n`;
                    }
                }
                prompt += `\n`;
            }

            prompt += `\nExplain what all this means for the project in simple terms. What's working? What's concerning? What should they do?`;

            return prompt;
        }
    },

    EXPLAIN_RISK: {
        systemInstruction: `You are an expert in climate risk assessment for ecological restoration projects.
Analyze the risk prediction data and explain what it means for project success.
Be specific about threats and provide mitigation strategies.`,
        formatData: (data: any) => {
            return `Analyze this risk prediction data:\n${JSON.stringify(data, null, 2)}`;
        }
    },

    EXPLAIN_GROWTH: {
        systemInstruction: `You are an expert in carbon sequestration and plant growth modeling.
Analyze the growth curve and health data to explain project performance.`,
        formatData: (data: any) => {
            return `Analyze this growth and health data:\n${JSON.stringify(data, null, 2)}`;
        }
    },

    GENERATE_TASKS: {
        systemInstruction: `You are a project manager AI that generates actionable tasks for a Kanban board.

RULES:
- Return ONLY a valid JSON array of tasks, no other text
- Each task must have: "title" (string, max 60 chars), "description" (string, 1-2 sentences), "priority" ("low" | "medium" | "high")
- Generate exactly 3-5 specific, actionable tasks
- Tasks should be clear, concrete, and immediately actionable
- Order tasks by importance/priority

Example output:
[
  {"title": "Design login page wireframe", "description": "Create low-fidelity wireframe for the login screen with email and password fields.", "priority": "high"},
  {"title": "Set up authentication API", "description": "Implement JWT-based authentication endpoints.", "priority": "high"},
  {"title": "Write unit tests", "description": "Add test coverage for auth flow.", "priority": "medium"}
]`,
        formatData: (data: any) => {
            const { context, existingTasks } = data;
            let prompt = `Generate Kanban tasks for: "${context}"\n\n`;

            if (existingTasks && existingTasks.length > 0) {
                prompt += `Existing tasks (avoid duplicates): ${existingTasks.join(", ")}\n\n`;
            }

            prompt += `Return ONLY the JSON array, no markdown, no explanation.`;
            return prompt;
        }
    }
};

// ============================================================
// CORE GEMINI SDK CALLER
// ============================================================

async function callGemini(
    promptType: PromptType,
    data: any,
    apiKey: string
): Promise<string> {
    const config = PROMPTS[promptType];
    const userPrompt = config.formatData(data);

    // Initialize the Gemini SDK
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        systemInstruction: config.systemInstruction,
    });

    const generationConfig = {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
    };

    const chatSession = model.startChat({
        generationConfig,
        history: [],
    });

    const result = await chatSession.sendMessage(userPrompt);
    return result.response.text();
}

// ============================================================
// CONVEX ACTIONS - Exposed API endpoints
// ============================================================

/**
 * Explain analytics data for a project using Gemini AI
 */
export const explainAnalytics = action({
    args: {
        projectId: v.id("projects"),
    },
    handler: async (ctx, args) => {
        // Get API key from environment
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY not configured. Run: npx convex env set GEMINI_API_KEY <your-key>");
        }

        // Fetch project data with analyses
        const projectData = await ctx.runQuery(api.projects.getProjectWithAnalytics, {
            projectId: args.projectId
        });

        if (!projectData) {
            throw new Error("Project not found");
        }

        // Call Gemini API using SDK
        const explanation = await callGemini("EXPLAIN_ANALYTICS", {
            project: {
                name: projectData.name,
                description: projectData.description,
            },
            analyses: projectData.analyses || []
        }, apiKey);

        return { explanation };
    }
});

/**
 * Generic AI explanation action - can be extended for different prompt types
 */
export const explain = action({
    args: {
        promptType: v.string(),
        data: v.any(),
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY not configured. Run: npx convex env set GEMINI_API_KEY <your-key>");
        }

        const promptType = args.promptType as PromptType;
        if (!PROMPTS[promptType]) {
            throw new Error(`Unknown prompt type: ${args.promptType}`);
        }

        const explanation = await callGemini(promptType, args.data, apiKey);
        return { explanation };
    }
});
