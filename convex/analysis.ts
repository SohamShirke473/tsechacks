import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveAnalysis = mutation({
    args: {
        lat: v.number(),
        lon: v.number(),
        soilData: v.any(), // Using v.any() to avoid duplication of complex types for now, can refine if needed
        weatherData: v.any(),
        results: v.any()
    },
    handler: async (ctx, args) => {
        // Basic caching check could go here, but for now just insert new record
        const id = await ctx.db.insert("analyses", {
            lat: args.lat,
            lon: args.lon,
            timestamp: Date.now(),
            soilData: args.soilData,
            weatherData: args.weatherData,
            // Map domain objects to schema shape if necessary, or ensure they match
            results: args.results.map((r: any) => ({
                plantName: r.plant.name,
                score: r.result.score,
                suitability: r.result.suitability,
                recommendations: r.result.recommendations
            }))
        });
        return id;
    }
});

export const getAnalysis = query({
    args: { id: v.id("analyses") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    }
});
