import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    analyses: defineTable({
        lat: v.number(),
        lon: v.number(),
        timestamp: v.number(),
        site_name: v.optional(v.string()), // New field from SiteScouter
        ssi_score: v.optional(v.number()), // New field from SiteScouter
        soilData: v.object({
            ph: v.number(),
            organicMatter: v.number(),
            texture: v.object({
                clay: v.number(),
                sand: v.number(),
                silt: v.number()
            }),
            nitrogen: v.number(),
            classification: v.string()
        }),
        weatherData: v.object({
            temp: v.number(),
            humidity: v.number(),
            rainfall: v.number(),
            pressure: v.number(),
            clouds: v.number(),
            description: v.string()
        }),
        // Storing the top recommendation or full JSON blob might be easier for complex nested objects
        // but structuring it allows querying. For hackathon, JSON blob or simplified struct is okay.
        // Let's try to structure it deeply for "strong" implementation.
        results: v.array(v.object({
            plantName: v.string(),
            score: v.number(), // 0-1
            suitability: v.string(),
            recommendations: v.array(v.string())
        }))
    }).index("by_location", ["lat", "lon"])
});
