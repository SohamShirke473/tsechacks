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
                species: v.string(),
                analysis_duration: v.string(),
                trend_status: v.string()
            }),
            long_term: v.object({
                survival_probability_3yr: v.number(),
                heat_stress_trend: v.object({
                    year_1: v.number(),
                    year_2: v.number(),
                    year_3: v.number()
                }),
                average_annual_rainfall: v.number(),
                primary_threat: v.string()
            }),
            time_series_graph: v.object({
                description: v.string(),
                data_points: v.array(v.object({
                    month_index: v.number(),
                    date: v.string(),
                    avg_temp: v.number(),
                    total_rain: v.number(),
                    temp_limit: v.number()
                }))
            })
        })),
        // Continuous analytics data from external API
        continuousAnalytics: v.optional(v.object({
            meta: v.object({
                lat: v.number(),
                lon: v.number(),
                ndvi_source: v.string(),
                simulation_active: v.boolean()
            }),
            widget_growth_curve: v.object({
                title: v.string(),
                x_axis_labels: v.array(v.string()),
                y_axis_data: v.array(v.number()),
                total_potential: v.string()
            }),
            widget_health_badge: v.object({
                status: v.string(),
                density_gain: v.string(),
                current_ndvi_value: v.number(),
                ui_color: v.string()
            }),
            widget_audit_stamp: v.object({
                verified_by: v.string(),
                dataset: v.string(),
                productivity_factor: v.number(),
                growth_velocity_k: v.number()
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
