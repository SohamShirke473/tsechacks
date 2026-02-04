import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import { api } from "./_generated/api";

// Action to fetch risk prediction from external API
export const predictRisk = action({
    args: {
        lat: v.number(),
        lon: v.number(),
        species: v.string(),
        analysisId: v.id("analyses")
    },
    handler: async (ctx, args) => {
        try {
            const url = `https://proglottidean-addyson-malapertly.ngrok-free.dev/predict-risk?lat=${args.lat}&lon=${args.lon}&species=${encodeURIComponent(args.species)}`;

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

            // Transform data to match schema (Year 1 -> year_1)
            const formattedData = {
                ...data,
                long_term: {
                    ...data.long_term,
                    heat_stress_trend: {
                        year_1: data.long_term.heat_stress_trend["Year 1"],
                        year_2: data.long_term.heat_stress_trend["Year 2"],
                        year_3: data.long_term.heat_stress_trend["Year 3"],
                    }
                }
            };

            // Store the risk prediction data in the analysis
            await ctx.runMutation(api.riskPrediction.saveRiskPrediction, {
                analysisId: args.analysisId,
                riskData: formattedData
            });

            return formattedData;
        } catch (error) {
            console.error("Error fetching risk prediction:", error);
            throw new Error(`Failed to fetch risk prediction: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
});

// Mutation to save risk prediction data to an analysis
export const saveRiskPrediction = mutation({
    args: {
        analysisId: v.id("analyses"),
        riskData: v.any() // Using v.any() for flexibility with API response
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.analysisId, {
            riskPrediction: args.riskData
        });
    }
});
