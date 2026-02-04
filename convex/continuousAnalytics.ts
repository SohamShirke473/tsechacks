import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import { api } from "./_generated/api";

// Action to fetch continuous analytics from external API
export const fetchContinuousAnalytics = action({
    args: {
        lat: v.number(),
        lon: v.number(),
        species: v.string(),
        simulateDrought: v.boolean(),
        analysisId: v.id("analyses")
    },
    handler: async (ctx, args) => {
        try {
            const baseUrl = "https://proglottidean-addyson-malapertly.ngrok-free.dev/continuous-analytics";
            const url = `${baseUrl}?lat=${args.lat}&lon=${args.lon}&species=${encodeURIComponent(args.species)}&simulate_drought=${args.simulateDrought}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();

            // Store the continuous analytics data directly (API includes meta.simulation_active)
            await ctx.runMutation(api.continuousAnalytics.saveContinuousAnalytics, {
                analysisId: args.analysisId,
                analyticsData: data
            });

            return data;
        } catch (error) {
            console.error("Error fetching continuous analytics:", error);
            throw new Error(`Failed to fetch continuous analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
});

// Mutation to save continuous analytics data to an analysis
export const saveContinuousAnalytics = mutation({
    args: {
        analysisId: v.id("analyses"),
        analyticsData: v.any() // Using v.any() for flexibility with API response
    },
    handler: async (ctx, args) => {
        const isDrought = args.analyticsData?.meta?.simulation_active === true;

        if (isDrought) {
            await ctx.db.patch(args.analysisId, {
                droughtAnalytics: args.analyticsData
            });
        } else {
            await ctx.db.patch(args.analysisId, {
                continuousAnalytics: args.analyticsData
            });
        }
    }
});
