import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new Project (Container)
export const createProject = mutation({
    args: {
        name: v.string(),
        description: v.string(),
    },
    handler: async (ctx, args) => {
        const projectId = await ctx.db.insert("projects", {
            name: args.name,
            description: args.description,
            status: "Active",
            creationTime: Date.now()
        });
        return projectId;
    }
});

// Assign an existing Analysis to a Project
export const addToProject = mutation({
    args: {
        projectId: v.id("projects"),
        analysisId: v.id("analyses"),
        selectedPlants: v.optional(v.array(v.string()))
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.analysisId, {
            projectId: args.projectId,
            selectedPlants: args.selectedPlants
        });
    }
});

// Get all projects for selection
export const getProjects = query({
    handler: async (ctx) => {
        return await ctx.db.query("projects").order("desc").collect();
    }
});

// Get analyses for a specific project
export const getProjectAnalyses = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("analyses")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .collect();
    }
});

// Get project with all analytics data for dashboard
export const getProjectWithAnalytics = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.projectId);
        if (!project) {
            return null;
        }

        const analyses = await ctx.db
            .query("analyses")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .collect();

        return {
            ...project,
            analyses
        };
    }
});
