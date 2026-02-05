from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# --- IMPORT ENGINES ---
from stage1 import SiteScouterV2
from stage3 import EarlyWarningSystem
from stage4 import GEEImpactEngine
from overlay import IndiaOverlayEngine  # Importing your new overlay logic

app = FastAPI(title="AgriQCert: Adaptive Reforestation Platform")

# --- CORS MIDDLEWARE (Required for ngrok & Frontend access) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],
)

# --- INITIALIZE ENGINES ---
print("--- 🟢 SYSTEM STARTUP: Initializing Engines ---")
scout = SiteScouterV2()
ews = EarlyWarningSystem()
# Pass Stage 3's Knowledge Base to Stage 4 for shared intelligence
gee_engine = GEEImpactEngine(ews.KNOWLEDGE_BASE)
# Initialize the Map Overlay Engine
overlay_engine = IndiaOverlayEngine()


# ==========================================
# 0. NEW ROUTE: MAP OVERLAY (India-wide Heatmap)
# ==========================================
@app.get("/api/map/india-suitability")
async def map_route():
    """
    Returns a dynamic Tile URL for Leaflet to overlay the 
    'Reforestation Opportunity' heatmap across India.
    """
    try:
        tile_url = overlay_engine.get_suitability_tile_url()
        if not tile_url:
            raise HTTPException(status_code=500, detail="Failed to generate GEE tiles.")
        
        return {
            "status": "success",
            "tile_url": tile_url,
            "attribution": "Google Earth Engine | AgriQCert"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 1. EXISTING ROUTE: STAGE 1 (Site Scouting)
# ==========================================
@app.get("/analyze/{lat}/{lon}")
async def analyze_get(lat: float, lon: float, name: str = "Query Point"):
    try:
        ssi_score = scout.analyze_site(lat, lon, name)
        
        if ssi_score is None:
            raise HTTPException(status_code=404, detail="Analysis failed for these coordinates.")
            
        return {
            "site_name": name,
            "ssi_score": ssi_score,
            "lat": lat,
            "lon": lon,
            "status": "Success",
            "message": "Analysis completed using original SiteScouter logic"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 2. EXISTING ROUTE: STAGE 3 (Weather Risk)
# ==========================================
@app.get("/predict-risk")
async def predict_risk(lat: float, lon: float, species: str):
    try:
        report = ews.analyze_everything(lat, lon, species)
        if not report:
            raise HTTPException(status_code=500, detail="Weather data fetch failed or Species not found.")
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 3. EXISTING ROUTE: STAGE 4 (The Dashboard)
# ==========================================
@app.get("/continuous-analytics")
async def get_dashboard_metrics(
    lat: float, 
    lon: float, 
    species: str, 
    baseline_ndvi: float = 0.2, 
    current_ndvi: float = None,
    simulate_drought: bool = False
):
    try:
        print(f"\n📊 DASHBOARD REQUEST: {species} @ {lat},{lon} | Drought Sim: {simulate_drought}")

        if current_ndvi is None:
            print("🛰️ No NDVI provided. Triggering Live Sentinel-2 Fetch...")
            current_ndvi = gee_engine.get_live_ndvi(lat, lon)

        risk_report = ews.analyze_everything(lat, lon, species)
        
        if not risk_report:
            survival_prob = 0.85 
        else:
            survival_prob = risk_report['long_term']['survival_probability_3yr']

        if simulate_drought:
            survival_prob = survival_prob * 0.6
            current_ndvi = current_ndvi * 0.85 
            print("⚠️ DROUGHT SIMULATION APPLIED.")

        audit_result = gee_engine.analyze_restoration_trend(
            species=species,
            survival_prob=survival_prob,
            baseline_ndvi=baseline_ndvi,
            current_ndvi=current_ndvi,
            lat=lat,
            lon=lon
        )

        return {
            "meta": {
                "lat": lat,
                "lon": lon,
                "ndvi_source": "Satellite (Sentinel-2)" if current_ndvi is not None else "Manual Override",
                "simulation_active": simulate_drought
            },
            "widget_growth_curve": {
                "title": f"10-Year Carbon Sequestration Forecast ({species})",
                "x_axis_labels": [f"Year {x['year']}" for x in audit_result['carbon_trajectory']],
                "y_axis_data": [x['stored_kg'] for x in audit_result['carbon_trajectory']],
                "total_potential": f"{audit_result['carbon_trajectory'][-1]['stored_kg']} kg"
            },
            "widget_health_badge": {
                "status": audit_result['health_analytics']['status'],
                "density_gain": audit_result['health_analytics']['density_gain'],
                "current_ndvi_value": round(current_ndvi, 3),
                "ui_color": "green" if audit_result['health_analytics']['status'] == "THRIVING" else "yellow"
            },
            "widget_audit_stamp": {
                "verified_by": "Google Earth Engine",
                "dataset": "MODIS & Sentinel-2",
                "productivity_factor": audit_result['verified_audit']['productivity_factor'],
                "growth_velocity_k": audit_result['verified_audit']['growth_velocity_k']
            }
        }

    except Exception as e:
        print(f"❌ DASHBOARD ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)