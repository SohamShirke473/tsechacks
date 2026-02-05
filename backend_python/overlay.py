import ee
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

class IndiaOverlayEngine:
    def __init__(self):
        """
        Initializes the Earth Engine connection for large-scale raster processing.
        """
        try:
            # Note: ee.Initialize() should be called here or in main.py
            if not ee.data._credentials:
                ee.Initialize()
            print("✅ GEE Overlay Engine: Initialized")
        except Exception as e:
            print(f"⚠️ GEE Overlay Engine Init Warning: {e}")

    def get_suitability_tile_url(self):
        """
        Calculates a Suitability Mask for the entire Indian Subcontinent.
        Logic: ESA WorldCover Bare Soil + Sentinel-2 Low NDVI.
        """
        try:
            # 1. Define the Boundary (India)
            # Dataset: Large Scale International Boundary (LSIB)
            india = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017") \
                      .filter(ee.Filter.eq('country_na', 'India'))

            # 2. Land Cover Filter (ESA WorldCover 10m)
            # We target Class 60: Bare / Sparse Vegetation
            lulc = ee.Image("ESA/WorldCover/v100/2020").clip(india)
            bare_soil_mask = lulc.eq(60)

            # 3. Vegetation Filter (Sentinel-2 Cloud-Free Composite)
            # We use a median composite to ensure no clouds are in the final overlay
            s2_collection = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED") \
                .filterBounds(india) \
                .filterDate('2024-01-01', '2024-12-31') \
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 15)) \
                .median()
            
            # Calculate NDVI: (NIR - Red) / (NIR + Red)
            ndvi = s2_collection.normalizedDifference(['B8', 'B4']).rename('NDVI')

            # 4. The "Reforestation Opportunity" Mask
            # Rule: It must be Bare Soil AND have an NDVI between 0.05 (not water/urban) 
            # and 0.25 (not already a forest).
            suitability_mask = bare_soil_mask.updateMask(
                ndvi.gt(0.05).And(ndvi.lt(0.25))
            )

            # 5. Visual Styling (The "Heatmap" Look)
            # 0 is transparent (#00000000), 1 is Neon Green (#39FF14)
            vis_params = {
                'min': 0,
                'max': 1,
                'palette': ['#00000000', '#39FF14'], 
            }

            # 6. Generate the XYZ Tile URL template
            map_id = suitability_mask.getMapId(vis_params)
            
            print("🛰️ GEE: Dynamic MapID successfully generated for India.")
            return map_id['tile_fetcher'].url_format

        except Exception as e:
            print(f"❌ GEE Overlay Error: {e}")
            return None

# --- INTEGRATION SNIPPET FOR main.py ---
# To use this in your main app, you would do:
# from overlay import IndiaOverlayEngine
# overlay_engine = IndiaOverlayEngine()
# @app.get("/api/map/india-suitability")
# async def map_route():
#     return {"tile_url": overlay_engine.get_suitability_tile_url()}