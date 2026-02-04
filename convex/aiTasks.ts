import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generate tasks based on project analytics data using AI
 * Analyzes risk predictions, continuous analytics, and site data to create actionable tasks
 */
export const generateTasksFromAnalytics = action({
    args: {
        projectId: v.id("projects"),
        columnId: v.id("kanbanColumns"),
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY not configured. Run: npx convex env set GEMINI_API_KEY <your-key>");
        }

        // Fetch project with all analytics
        const projectData = await ctx.runQuery(api.projects.getProjectWithAnalytics, {
            projectId: args.projectId
        });

        if (!projectData || !projectData.analyses || projectData.analyses.length === 0) {
            throw new Error("No analytics data found for this project");
        }

        // Build context from analytics data
        let analyticsContext = `Project: ${projectData.name}\n${projectData.description || ""}\n\n`;
        analyticsContext += "SITE ANALYSIS DATA:\n";

        for (const analysis of projectData.analyses) {
            analyticsContext += `\n--- Site: ${analysis.site_name || `Location ${analysis.lat.toFixed(2)}, ${analysis.lon.toFixed(2)}`} ---\n`;
            analyticsContext += `Species: ${analysis.selectedPlants?.join(", ") || "Not specified"}\n`;
            analyticsContext += `SSI Score: ${analysis.ssi_score?.toFixed(2) || "N/A"}/1.0\n`;

            // Risk prediction data
            if (analysis.riskPrediction) {
                const risk = analysis.riskPrediction;
                analyticsContext += `\nRISK ASSESSMENT:\n`;
                analyticsContext += `- 3-Year Survival Probability: ${(risk.long_term.survival_probability_3yr * 100).toFixed(0)}%\n`;
                analyticsContext += `- Primary Threat: ${risk.long_term.primary_threat}\n`;
                analyticsContext += `- Trend: ${risk.metadata.trend_status}\n`;
                analyticsContext += `- Annual Rainfall: ${risk.long_term.average_annual_rainfall}mm\n`;
                analyticsContext += `- Heat Stress Year 1: ${risk.long_term.heat_stress_trend.year_1}\n`;
                analyticsContext += `- Heat Stress Year 2: ${risk.long_term.heat_stress_trend.year_2}\n`;
                analyticsContext += `- Heat Stress Year 3: ${risk.long_term.heat_stress_trend.year_3}\n`;
            }

            // Continuous analytics data
            if (analysis.continuousAnalytics) {
                const ca = analysis.continuousAnalytics;
                analyticsContext += `\nHEALTH & GROWTH DATA:\n`;
                analyticsContext += `- Health Status: ${ca.widget_health_badge?.status}\n`;
                analyticsContext += `- Current NDVI: ${ca.widget_health_badge?.current_ndvi_value}\n`;
                analyticsContext += `- Density Change: ${ca.widget_health_badge?.density_gain}\n`;
                analyticsContext += `- Carbon Potential: ${ca.widget_growth_curve?.total_potential}\n`;
                analyticsContext += `- Productivity Factor: ${ca.widget_audit_stamp?.productivity_factor}x\n`;
                if (ca.meta?.simulation_active) {
                    analyticsContext += `- ⚠️ DROUGHT SIMULATION ACTIVE\n`;
                }
            }

            // Soil data
            if (analysis.soilData) {
                analyticsContext += `\nSOIL CONDITIONS:\n`;
                analyticsContext += `- pH: ${analysis.soilData.ph}\n`;
                analyticsContext += `- Organic Matter: ${analysis.soilData.organicMatter}%\n`;
                analyticsContext += `- Classification: ${analysis.soilData.classification}\n`;
            }
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            systemInstruction: `You are an environmental restoration expert analyzing project data to generate actionable tasks.

RULES:
- Return ONLY a valid JSON array of tasks, no other text or markdown
- Generate 4-6 specific, actionable tasks based on the analytics data
- Each task must address real issues found in the data (low survival rate, threats, poor health, etc.)
- Each task must have: "title" (max 60 chars), "description" (1-2 sentences explaining why this matters), "priority" ("high" | "medium" | "low")
- Priority should be based on urgency: threats = high, optimization = medium, monitoring = low
- Tasks should be concrete actions a land manager can take

TASK CATEGORIES TO CONSIDER:
1. Risk mitigation (address primary threats like drought, heat stress)
2. Soil improvement (based on pH, organic matter)
3. Plant health monitoring (NDVI, density)
4. Water management (rainfall, drought simulation)
5. Species optimization (survival rates, suitability)
6. Growth optimization (carbon capture, productivity)

Example output:
[
  {"title": "Install drip irrigation system", "description": "Low rainfall (320mm/yr) threatens 3-year survival. Irrigation can improve survival probability by 20%.", "priority": "high"},
  {"title": "Apply mulch layer to retain moisture", "description": "Heat stress increasing each year. Mulching reduces soil temperature and evaporation.", "priority": "high"},
  {"title": "Schedule monthly NDVI monitoring", "description": "Current NDVI at 0.45 needs tracking to catch decline early.", "priority": "medium"}
]`,
        });

        const prompt = `Based on this project analytics data, generate actionable tasks:\n\n${analyticsContext}\n\nReturn ONLY the JSON array, no explanation.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse the JSON response
        let tasks: Array<{ title: string; description: string; priority: string }>;
        try {
            let cleanedResponse = responseText.trim();
            if (cleanedResponse.startsWith("```json")) {
                cleanedResponse = cleanedResponse.slice(7);
            }
            if (cleanedResponse.startsWith("```")) {
                cleanedResponse = cleanedResponse.slice(3);
            }
            if (cleanedResponse.endsWith("```")) {
                cleanedResponse = cleanedResponse.slice(0, -3);
            }
            cleanedResponse = cleanedResponse.trim();

            tasks = JSON.parse(cleanedResponse);

            if (!Array.isArray(tasks)) {
                throw new Error("Response is not an array");
            }
        } catch (e) {
            console.error("Failed to parse AI response:", responseText);
            throw new Error("AI generated invalid task format. Please try again.");
        }

        // Validate and sanitize tasks
        const validTasks = tasks
            .filter(t => t.title && typeof t.title === "string")
            .map(t => ({
                title: t.title.slice(0, 100),
                description: t.description?.slice(0, 500) || "",
                priority: ["low", "medium", "high"].includes(t.priority) ? t.priority : "medium",
            }));

        if (validTasks.length === 0) {
            throw new Error("AI did not generate any valid tasks. Please try again.");
        }

        // Create tasks in the database
        await ctx.runMutation(api.kanban.createTasksBulk, {
            columnId: args.columnId,
            tasks: validTasks,
        });

        return {
            success: true,
            tasksCreated: validTasks.length,
            tasks: validTasks,
        };
    },
});

/**
 * Generate tasks using AI from user prompt (original function)
 */
export const generateTasks = action({
    args: {
        columnId: v.id("kanbanColumns"),
        context: v.string(),
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY not configured. Run: npx convex env set GEMINI_API_KEY <your-key>");
        }

        // Get existing tasks to avoid duplicates
        const column = await ctx.runQuery(api.kanban.getColumnTasks, {
            columnId: args.columnId
        });

        const existingTasks = column?.tasks?.map((t: { title: string }) => t.title) || [];

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
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
        });

        let prompt = `Generate Kanban tasks for: "${args.context}"\n\n`;
        if (existingTasks.length > 0) {
            prompt += `Existing tasks (avoid duplicates): ${existingTasks.join(", ")}\n\n`;
        }
        prompt += `Return ONLY the JSON array, no markdown, no explanation.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse the JSON response
        let tasks: Array<{ title: string; description: string; priority: string }>;
        try {
            let cleanedResponse = responseText.trim();
            if (cleanedResponse.startsWith("```json")) {
                cleanedResponse = cleanedResponse.slice(7);
            }
            if (cleanedResponse.startsWith("```")) {
                cleanedResponse = cleanedResponse.slice(3);
            }
            if (cleanedResponse.endsWith("```")) {
                cleanedResponse = cleanedResponse.slice(0, -3);
            }
            cleanedResponse = cleanedResponse.trim();

            tasks = JSON.parse(cleanedResponse);

            if (!Array.isArray(tasks)) {
                throw new Error("Response is not an array");
            }
        } catch (e) {
            console.error("Failed to parse AI response:", responseText);
            throw new Error("AI generated invalid task format. Please try again.");
        }

        // Validate and sanitize tasks
        const validTasks = tasks
            .filter(t => t.title && typeof t.title === "string")
            .map(t => ({
                title: t.title.slice(0, 100),
                description: t.description?.slice(0, 500) || "",
                priority: ["low", "medium", "high"].includes(t.priority) ? t.priority : "medium",
            }));

        if (validTasks.length === 0) {
            throw new Error("AI did not generate any valid tasks. Please try again.");
        }

        // Create tasks in the database
        await ctx.runMutation(api.kanban.createTasksBulk, {
            columnId: args.columnId,
            tasks: validTasks,
        });

        return {
            success: true,
            tasksCreated: validTasks.length,
            tasks: validTasks,
        };
    },
});
