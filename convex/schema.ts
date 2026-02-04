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
        projectId: v.optional(v.id("projects")), // Link to Project
        selectedPlants: v.optional(v.array(v.string())), // Plants selected for this project
        results: v.array(v.object({
            plantName: v.string(),
            score: v.number(), // 0-1
            suitability: v.string(),
            recommendations: v.array(v.string())
        })),
        // Risk prediction data from external API
        riskPrediction: v.optional(v.object({
            metadata: v.object({
                lat: v.number(),
                lon: v.number(),
                species: v.string(),
                timestamp: v.string()
            }),
            short_term: v.object({
                temp_z_score: v.number(),
                rain_z_score: v.number(),
                humidity_z_score: v.number(),
                disease_outbreak_risk: v.string()
            }),
            long_term: v.object({
                survival_probability_3yr: v.number(),
                primary_threat: v.string(),
                status: v.string(),
                climatology: v.object({
                    annual_max: v.string(),
                    annual_min: v.string(),
                    annual_rainfall_mm: v.number()
                })
            }),
            biological_thresholds: v.object({
                max_temp: v.number(),
                min_temp: v.number(),
                water_needs: v.string(),
                max_annual_rain: v.number(),
                vulnerability: v.number()
            })
        }))
    }).index("by_location", ["lat", "lon"])
        .index("by_project", ["projectId"]), // Index for querying analyses by project

    projects: defineTable({
        name: v.string(),
        description: v.string(),
        status: v.string(), // "Active", "Archived"
        createdBy: v.optional(v.string()),
        creationTime: v.number()
    }).index("by_timestamp", ["creationTime"])
});
