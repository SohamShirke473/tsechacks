import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { fetchSoilData } from "../src/lib/api/soilgrids";
import { fetchWeatherData } from "../src/lib/api/weather";
import { fetchSiteAnalysis } from "../src/lib/api/site-scouter";
import { findBestMatches } from "../src/lib/expert-system";

/**
 * Action to perform a fresh analysis by calling external APIs.
 * This is an action because it performs fetch requests.
 */
export const analyzeSite = action({
    args: { lat: v.number(), lon: v.number() },
    handler: async (ctx, args): Promise<any> => {
        // 1. Fetch Data concurrently
        // Note: SiteScouter API is quite fast, but we'll fetch it along with others.
        // We'll wrap it to handle failures gracefully if needed, but for now we let it fail as per requirements to "base logic around this".
        const [soil, weather, siteAnalysis, locationData] = await Promise.all([
            fetchSoilData(args.lat, args.lon),
            fetchWeatherData(args.lat, args.lon),
            fetchSiteAnalysis(args.lat, args.lon).catch((e: any) => {
                console.error("Site analysis failed", e);
                return null;
            }),
            // Fetch location name
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${args.lat}&lon=${args.lon}`, {
                headers: { 'User-Agent': 'EcologicalSiteScout/1.0' }
            }).then(res => res.ok ? res.json() : null).catch(e => {
                console.error("Geocoding failed", e);
                return null;
            })
        ]);

        // 2. Run Logic
        const results = findBestMatches(soil, weather);

        // Use geocoded name if available, fallback to siteAnalysis name, then Unknown
        const locationName = locationData?.display_name || locationData?.name || siteAnalysis?.site_name || "Unknown Location";

        // 3. Store result via mutation
        const analysisId = await ctx.runMutation((internal as any).analysis.saveAnalysis, {
            lat: args.lat,
            lon: args.lon,
            site_name: locationName,
            ssi_score: siteAnalysis?.ssi_score,
            soilData: soil,
            weatherData: weather,
            results: results
        });

        // Return combined data including location name for UI
        return { analysisId, soil, weather, results, siteAnalysis: { ...siteAnalysis, site_name: locationName } };
    }
});
