import { SoilData } from "./api/soilgrids";
import { WeatherData } from "./api/weather";

// --- Types ---

export interface PlantRequirement {
    name: string;
    idealPh: number;
    phTolerance: number; // +/- range
    idealTemp: number;
    minTemp: number;
    maxTemp: number;
    waterNeeds: "Low" | "Moderate" | "High";
    soilTexturePreferences: string[]; // ["Sandy", "Loam", "Clay"]
    description: string;
}

export interface AnalysisResult {
    score: number; // 0 to 1
    suitability: "Excellent" | "Good" | "Fair" | "Poor";
    factors: {
        phScore: number;
        textureScore: number;
        climateScore: number;
    };
    recommendations: string[];
}

// --- Hardcoded Native Knowledge Base (to be strong & specific) ---
// Focused on Indian Subcontinent contexts for the Hackathon
export const KNOWLEDGE_BASE: PlantRequirement[] = [
    {
        name: "Neem (Azadirachta indica)",
        idealPh: 7.0,
        phTolerance: 1.5, // 5.5 - 8.5
        idealTemp: 30,
        minTemp: 5,
        maxTemp: 45,
        waterNeeds: "Low",
        soilTexturePreferences: ["Sandy", "Loam", "Clay"], // Very hardy
        description: " drought-resistant, nitrogen-fixing properties."
    },
    {
        name: "Tulsi (Ocimum tenuiflorum)",
        idealPh: 6.5,
        phTolerance: 1.0,
        idealTemp: 25,
        minTemp: 10,
        maxTemp: 35,
        waterNeeds: "Moderate",
        soilTexturePreferences: ["Loam", "Sandy"],
        description: "Medicinal herb, requires good drainage."
    },
    {
        name: "Bamboo (Bambusa vulgaris)",
        idealPh: 6.0,
        phTolerance: 1.0,
        idealTemp: 25,
        minTemp: 15,
        maxTemp: 38,
        waterNeeds: "High",
        soilTexturePreferences: ["Loam", "Clay"],
        description: "Fast growing, good for soil erosion control."
    },
    {
        name: "Mango (Mangifera indica)",
        idealPh: 6.0,
        phTolerance: 1.0, // 5.5-7.5
        idealTemp: 27,
        minTemp: 10,
        maxTemp: 42,
        waterNeeds: "Moderate",
        soilTexturePreferences: ["Loam", "Clay"], // Deep soil needed
        description: "Fruit tree, needs deep well-drained soil."
    },
    {
        name: "Rose (Rosa)",
        idealPh: 6.5,
        phTolerance: 0.5,
        idealTemp: 20,
        minTemp: 10,
        maxTemp: 30,
        waterNeeds: "Moderate",
        soilTexturePreferences: ["Loam", "Clay"],
        description: "Ornamental, requires nutrient-rich soil."
    },
    {
        name: "Cactus (Opuntia)",
        idealPh: 7.5,
        phTolerance: 1.0,
        idealTemp: 35,
        minTemp: 10,
        maxTemp: 50,
        waterNeeds: "Low",
        soilTexturePreferences: ["Sandy"],
        description: "Desert specialist, requires sandy soil and low moisture."
    },
    {
        name: "Fern (Polypodiopsida)",
        idealPh: 5.5,
        phTolerance: 0.8,
        idealTemp: 22,
        minTemp: 10,
        maxTemp: 30,
        waterNeeds: "High",
        soilTexturePreferences: ["Loam", "Clay"],
        description: "Shade-loving, requires moist acidic soil."
    },
    {
        name: "Lavender (Lavandula)",
        idealPh: 7.5,
        phTolerance: 0.5,
        idealTemp: 25,
        minTemp: 5,
        maxTemp: 35,
        waterNeeds: "Low",
        soilTexturePreferences: ["Sandy", "Loam"],
        description: "Aromatic herb, thrives in alkaline, well-drained soil."
    },
    {
        name: "Blueberry (Vaccinium)",
        idealPh: 5.0,
        phTolerance: 0.5,
        idealTemp: 20,
        minTemp: -5,
        maxTemp: 30,
        waterNeeds: "Moderate",
        soilTexturePreferences: ["Loam", "Sandy"],
        description: "Acid-loving fruiting shrub."
    },
    {
        name: "Teak (Tectona grandis)",
        idealPh: 7.0,
        phTolerance: 0.5,
        idealTemp: 30,
        minTemp: 15,
        maxTemp: 40,
        waterNeeds: "Moderate",
        soilTexturePreferences: ["Loam", "Clay"],
        description: "High-value timber, prefers deep, fertile soil."
    }
];

// --- The "Strong" Logic ---

/**
 * Gaussian Radial Basis Function for smooth scoring
 */
function gaussianScore(measured: number, ideal: number, tolerance: number): number {
    // A standard deviation approx 1/3 of tolerance means 99% fall within +/- tolerance
    // But strictly, let's say score drops to ~0.6 at +/- tolerance boundary.
    // sigma = tolerance.
    // exp(- (x-u)^2 / (2*t^2) )
    // Making the scoring stricter (sigma = tolerance / 1.5 instead of tolerance)
    const sigma = tolerance / 1.5;
    return Math.exp(-Math.pow(measured - ideal, 2) / (2 * Math.pow(sigma, 2)));
}

/**
 * Texture suitability score
 */
function getTextureScore(plant: PlantRequirement, soilClass: string): number {
    if (plant.soilTexturePreferences.includes(soilClass)) return 1.0;
    // Partial matches
    if (soilClass === "Loam") return 0.8; // Loam is generally good
    return 0.2; // Poor match
}

/**
 * Climate suitability score
 */
function getClimateScore(plant: PlantRequirement, weather: WeatherData): number {
    const tempScore = gaussianScore(weather.temp, plant.idealTemp, 10); // Wide tolerance for air temp

    // Water stress check
    let waterScore = 1.0;
    if (plant.waterNeeds === "High" && weather.rainfall < 1 && weather.humidity < 40) {
        waterScore = 0.4; // Needs irrigation
    }
    if (plant.waterNeeds === "Low" && weather.rainfall > 10) {
        waterScore = 0.6; // Risk of root rot
    }

    return (tempScore * 0.7) + (waterScore * 0.3);
}

/**
 * Main Analysis Function
 */
export function analyzeSite(soil: SoilData, weather: WeatherData, plant: PlantRequirement): AnalysisResult {
    // 1. pH Score
    const phScore = gaussianScore(soil.ph, plant.idealPh, plant.phTolerance);

    // 2. Texture Score
    const textureScore = getTextureScore(plant, soil.classification);

    // 3. Climate Score
    const climateScore = getClimateScore(plant, weather);

    // Weighted Total
    // pH is critical -> 0.4
    // Climate is current (snapshot) so less weight for long term -> 0.3
    // Texture is permanent -> 0.3
    const totalScore = (phScore * 0.4) + (textureScore * 0.3) + (climateScore * 0.3);

    let suitability: AnalysisResult["suitability"] = "Poor";
    if (totalScore > 0.85) suitability = "Excellent";
    else if (totalScore > 0.7) suitability = "Good";
    else if (totalScore > 0.5) suitability = "Fair";

    // Recommendations
    const recommendations: string[] = [];
    if (phScore < 0.6) {
        if (soil.ph < plant.idealPh) recommendations.push("Add Lime/Dolomite to raise pH");
        else recommendations.push("Add Sulfur/Peat Moss to lower pH");
    }
    if (soil.organicMatter < 2.0) {
        recommendations.push("Low Organic Matter: Add Compost or Manure");
    }
    if (plant.waterNeeds === "High" && weather.rainfall < 2) {
        recommendations.push("Ensure regular irrigation");
    }

    // Phosphorus availability logic
    if (soil.ph < 5.5) recommendations.push("Phosphorus likely locked by Iron/Aluminum. Add bone meal.");
    if (soil.ph > 7.5) recommendations.push("Phosphorus likely locked by Calcium. Use acidic fertilizer.");

    return {
        score: totalScore,
        suitability,
        factors: { phScore, textureScore, climateScore },
        recommendations
    };
}

export function findBestMatches(soil: SoilData, weather: WeatherData): Array<{ plant: PlantRequirement; result: AnalysisResult }> {
    return KNOWLEDGE_BASE.map(plant => ({
        plant,
        result: analyzeSite(soil, weather, plant)
    }))
        .sort((a, b) => b.result.score - a.result.score);
}
