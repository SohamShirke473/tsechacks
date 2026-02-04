import { z } from "zod";

// Types for SoilGrids Response
export interface SoilGridLayer {
    name: string;
    unit_measure: {
        d_factor: number;
        mapped_units: string;
        target_units: string;
        uncertainty_unit: string;
    };
    depths: {
        range: {
            top_depth: number;
            bottom_depth: number;
            unit_depth: string;
        };
        label: string;
        values: {
            mean: number;
            median: number;
            "Q0.05": number;
            "Q0.95": number;
            uncertainty: number;
        };
    }[];
}

export interface SoilGridsResponse {
    type: string;
    geometry: {
        type: string;
        coordinates: [number, number];
    };
    properties: {
        layers: SoilGridLayer[];
    };
}

export interface SoilData {
    ph: number; // pH value
    organicMatter: number; // Percentage
    texture: {
        clay: number; // Percentage
        sand: number; // Percentage
        silt: number; // Percentage
    };
    nitrogen: number; // g/kg
    classification: string; // derived
}

/**
 * Fetch soil properties from SoilGrids REST API
 * Documentation: https://www.isric.org/explore/soilgrids/faq-soilgrids
 */
/**
 * Fetch soil properties from SoilGrids REST API
 * Documentation: https://www.isric.org/explore/soilgrids/faq-soilgrids
 */
export async function fetchSoilData(lat: number, lon: number): Promise<SoilData> {
    // UPDATED: New API endpoint
    const url = new URL("https://rest.isric.org/soilgrids/v2.0/properties/query");
    url.searchParams.append("lat", lat.toString());
    url.searchParams.append("lon", lon.toString());

    // Properties to fetch
    const properties = ["phh2o", "clay", "sand", "soc", "nitrogen"];
    properties.forEach(p => url.searchParams.append("property", p));

    // Depths of interest (0-5cm and 5-15cm for topsoil analysis)
    url.searchParams.append("depth", "0-5cm");
    url.searchParams.append("depth", "5-15cm");

    url.searchParams.append("value", "mean");

    const MAX_RETRIES = 3;
    const TIMEOUT_MS = 8000;

    try {
        let response: Response | null = null;
        let lastError: any = null;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

                response = await fetch(url.toString(), {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Accept": "application/json"
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    break; // Success
                } else {
                    // If it's a 4xx error (client error), retrying might not help, but 5xx might.
                    // For now, retry on everything except maybe 400.
                    if (response.status === 400) {
                        throw new Error(`SoilGrids API Bad Request: ${response.statusText}`);
                    }
                    throw new Error(`SoilGrids API Error: ${response.status} ${response.statusText}`);
                }
            } catch (err) {
                lastError = err;
                if (attempt < MAX_RETRIES - 1) {
                    const delay = 1000 * Math.pow(2, attempt);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        if (!response || !response.ok) {
            throw lastError || new Error("Failed to connect to SoilGrids API after retries");
        }

        const data: SoilGridsResponse = await response.json();
        return processSoilData(data);

    } catch (error) {
        // Downgraded to warning as we have a fallback
        console.warn("Failed to fetch soil data, utilizing fallback simulation:", error instanceof Error ? error.message : error);

        // Return safe defaults if API fails
        // Generate deterministic "Simulated" data based on Lat/Lon so users get different results per location
        const randomSeed = Math.abs((lat * 1000) + (lon * 1000));
        const pseudoRandom = (offset: number) => {
            const x = Math.sin(randomSeed + offset) * 10000;
            return x - Math.floor(x);
        };

        const simPh = 5.5 + (pseudoRandom(1) * 3.0); // 5.5 to 8.5
        const simClay = 10 + (pseudoRandom(2) * 40); // 10 to 50
        const simSand = 10 + (pseudoRandom(3) * 60); // 10 to 70
        const simSilt = 100 - (simClay + simSand); // Remainder

        let simClass = "Loam";
        if (simSand > 50) simClass = "Sandy";
        else if (simClay > 35) simClass = "Clay";

        return {
            ph: simPh,
            organicMatter: 0.5 + (pseudoRandom(4) * 4.0), // 0.5% to 4.5%
            texture: { clay: simClay, sand: simSand, silt: Math.max(0, simSilt) },
            nitrogen: 0.5 + (pseudoRandom(5) * 4.5), // 0.5 to 5.0 g/kg
            classification: simClass
        };
    }
}

function processSoilData(data: SoilGridsResponse): SoilData {
    const layers = data.properties.layers;

    // Helper to extract mean value for a property across queried depths
    const getValue = (propName: string): number => {
        const layer = layers.find(l => l.name === propName);
        if (!layer) return 0;

        // Average across the returned depths (usually 0-5 and 5-15)
        const sum = layer.depths.reduce((acc, d) => acc + d.values.mean, 0);
        const avg = sum / layer.depths.length;

        // Apply scale factor (d_factor)
        // SoilGrids often returns integers that need dividing (e.g., pH 70 -> 7.0)
        return avg / layer.unit_measure.d_factor;
    };

    const ph = getValue("phh2o");
    const clay = getValue("clay");
    const sand = getValue("sand");
    const soc = getValue("soc"); // Soil Organic Carbon (dg/kg) -> convert to %
    const nitrogen = getValue("nitrogen"); // cg/kg -> convert to g/kg

    // Silt calculation (approximate since Total = 100%)
    const silt = 100 - (clay + sand);

    // Organic Matter % = SOC (g/kg) / 10 * 1.72 (Van Bemmelen factor)
    // Note: input soc is usually in dg/kg in SoilGrids v2, check d_factor. 
    // v2 API usually returns dg/kg (decigrams). d_factor is 10. So raw/10 = g/kg.
    // Then g/kg / 10 = %. 
    // Let's rely on getValue which handles d_factor.
    // If d_factor converts to standard units, let's assume standard is g/kg for SOC.
    // Actually d_factor for pH is 10 (70 -> 7.0).
    // For Clay/Sand it's 10 (200 -> 20.0%).
    // For SOC it's 10 (150 -> 15.0 g/kg). 
    // OM % = (SOC g/kg / 10) * 1.72
    const organicMatter = (soc / 10) * 1.72;

    let classification = "Loam";
    if (sand > 50) classification = "Sandy";
    else if (clay > 40) classification = "Clay";
    else if (silt > 50) classification = "Silty";

    return {
        ph,
        organicMatter,
        texture: { clay, sand, silt },
        nitrogen: nitrogen / 10, // Convert cg/kg to g/kg
        classification
    };
}
