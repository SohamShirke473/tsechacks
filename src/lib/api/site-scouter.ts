export interface SiteAnalysisResponse {
    site_name: string;
    ssi_score: number;
    lat: number;
    lon: number;
    status: string;
    message: string;
}

export async function fetchSiteAnalysis(lat: number, lon: number, name?: string): Promise<SiteAnalysisResponse> {
    const baseUrl = "https://proglottidean-addyson-malapertly.ngrok-free.dev";
    // const baseUrl = "http://0.0.0.0:8000";
    const queryName = name ? encodeURIComponent(name) : "Site Assessment";
    const url = `${baseUrl}/analyze/${lat}/${lon}?name=${queryName}`;

    try {
        const response = await fetch(url);
        console.log(response);
        if (!response.ok) {
            throw new Error(`Site Analysis API failed: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data as SiteAnalysisResponse;
    } catch (error) {
        console.error("Error fetching site analysis:", error);
        // Fallback or rethrow depending on desired behavior. 
        // For now, rethrowing so the main action knows it failed.
        throw error;
    }
}
