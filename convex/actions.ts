import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { fetchSoilData } from "../src/lib/api/soilgrids";
import { fetchWeatherData } from "../src/lib/api/weather";
import { findBestMatches } from "../src/lib/expert-system";

/**
 * Action to perform a fresh analysis by calling external APIs.
 * This is an action because it performs fetch requests.
 */
export const analyzeSite = action({
    args: { lat: v.number(), lon: v.number() },
    handler: async (ctx, args): Promise<any> => {
        // 1. Fetch Data concurrently
        const [soil, weather] = await Promise.all([
            fetchSoilData(args.lat, args.lon),
            fetchWeatherData(args.lat, args.lon)
        ]);

        // 2. Run Logic
        const results = findBestMatches(soil, weather);

        // 3. Store result via mutation
        const analysisId = await ctx.runMutation((internal as any).analysis.saveAnalysis, {
            lat: args.lat,
            lon: args.lon,
            soilData: soil,
            weatherData: weather,
            results: results
        });

        return { analysisId, soil, weather, results };
    }
});
