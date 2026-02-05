import pystac_client
import numpy as np
import overpy
from geopy.distance import geodesic
import planetary_computer
import warnings
from concurrent.futures import ThreadPoolExecutor, as_completed
import rasterio
from rasterio.windows import from_bounds
from rasterio.warp import transform_bounds

warnings.filterwarnings("ignore")

class SiteScouterV2:
    def __init__(self):
        self.catalog = pystac_client.Client.open(
            "https://planetarycomputer.microsoft.com/api/stac/v1",
            modifier=planetary_computer.sign_inplace
        )
        self.osm_api = overpy.Overpass()
        
        # ESA WorldCover LULC Classes
        self.lulc_map = {
            10: ("Tree Cover", 80, 0.15),
            20: ("Shrubland", 60, 0.75),
            30: ("Grassland", 55, 0.80),
            40: ("Cropland", 70, 0.60),
            50: ("Built-up", 30, 0.05),
            60: ("Bare/Sparse Vegetation", 45, 1.0),
            80: ("Water Bodies", 0, 0.0),
            100: ("Moss/Lichen", 40, 0.70)
        }

    def _read_cog_window(self, href, lat, lon, buffer=0.002):
        try:
            with rasterio.open(href) as src:
                left, bottom, right, top = transform_bounds(
                    "EPSG:4326", src.crs, 
                    lon - buffer, lat - buffer, lon + buffer, lat + buffer
                )
                window = from_bounds(left, bottom, right, top, src.transform)
                data = src.read(1, window=window)
                valid = data[data > 0]
                if len(valid) == 0: return None
                return float(np.median(valid))
        except:
            return None

    def fetch_sentinel2_direct(self, lat, lon):
        try:
            bbox = [lon - 0.005, lat - 0.005, lon + 0.005, lat + 0.005]
            search = self.catalog.search(
                collections=["sentinel-2-l2a"],
                bbox=bbox,
                datetime="2024-01-01/2024-12-31",
                query={"eo:cloud_cover": {"lt": 25}},
                max_items=1
            )
            items = list(search.items())
            if not items: return {"ndvi": 0.15, "ndwi": 0.0}

            item = items[0]
            bands = ["B04", "B08"]
            data_dict = {}
            
            for b in bands:
                href = item.assets[b].href
                val = self._read_cog_window(href, lat, lon, buffer=0.001)
                data_dict[b] = val if val else 1000 

            red = data_dict["B04"] / 10000.0
            nir = data_dict["B08"] / 10000.0

            ndvi = (nir - red) / (nir + red + 1e-8)
            return {"ndvi": float(ndvi), "ndwi": 0.05}
        except:
            return {"ndvi": 0.15, "ndwi": 0.0}

    def fetch_lulc_direct(self, lat, lon):
        try:
            bbox = [lon - 0.01, lat - 0.01, lon + 0.01, lat + 0.01]
            search = self.catalog.search(collections=["esa-worldcover"], bbox=bbox)
            items = list(search.items())
            if not items: return None
            
            val = self._read_cog_window(items[0].assets["map"].href, lat, lon, buffer=0.001)
            if val is None: return None
            
            name, soil, suit = self.lulc_map.get(int(val), ("Unknown", 50, 0.5))
            return {"class": name, "soil_depth": soil, "suitability": suit}
        except: return None

    def fetch_water_osm(self, lat, lon):
        try:
            query = f'[out:json][timeout:3];(way["natural"="water"](around:3000,{lat},{lon});way["waterway"~"river|stream"](around:3000,{lat},{lon}););out center 1;'
            result = self.osm_api.query(query)
            if not result.ways: return 3000
            return int(geodesic((lat, lon), (result.ways[0].center_lat, result.ways[0].center_lon)).meters)
        except: return 3000

    def is_urban_area(self, lat, lon):
        try:
            query = f'[out:json][timeout:3];(way["highway"](around:500,{lat},{lon});way["building"](around:500,{lat},{lon}););out count;'
            result = self.osm_api.query(query)
            return len(result.ways) > 5  
        except:
            return False

    def fetch_all_parallel(self, lat, lon):
        print(f"📡 Processing Satellite & Urban Pipelines...")
        results = {}
        # Using 4 workers to handle everything at once
        with ThreadPoolExecutor(max_workers=4) as executor:
            futures = {
                executor.submit(self.fetch_sentinel2_direct, lat, lon): 'sentinel',
                executor.submit(self.fetch_lulc_direct, lat, lon): 'lulc',
                executor.submit(self.is_urban_area, lat, lon): 'is_urban',
                executor.submit(self.fetch_water_osm, lat, lon): 'water_dist'
            }
            for future in as_completed(futures):
                results[futures[future]] = future.result()
        
        if not results.get('sentinel') or not results.get('lulc'): return None
        
        # Merge results into one dictionary
        combined = {**results['sentinel'], **results['lulc']}
        combined['is_urban'] = results.get('is_urban', False)
        combined['water_dist'] = results.get('water_dist', 3000)
        return combined

    def calculate_ssi(self, data):
        n_lulc = data.get('suitability', 0.5)
        
        ndvi = data['ndvi']
        if 0.05 <= ndvi <= 0.20: n_ndvi = 1.0  
        elif ndvi < 0.05: n_ndvi = 0.6  
        elif ndvi <= 0.40: n_ndvi = 0.4  
        else: n_ndvi = 0.1  
            
        water_m = data['water_dist']
        n_water = 1 / (1 + (water_m / 2500)**2)
        
        soil_cm = data.get('soil_depth', 30)
        n_soil = min(soil_cm / 100.0, 1.0)

        ssi = (n_lulc * 0.40) + (n_ndvi * 0.30) + (n_water * 0.20) + (n_soil * 0.10)
        
        if data['class'] in ["Built-up", "Water Bodies"]: ssi *= 0.1
        
        return round(ssi, 3), {"lulc": n_lulc, "ndvi": n_ndvi, "water": n_water}

    def analyze_site(self, lat, lon, name="Target"):
        data = self.fetch_all_parallel(lat, lon)
        if not data: 
            print("❌ Data Fetch Failed")
            return None
        
        is_urban_osm = data.get('is_urban', False)
        original_class = data.get('class')

        # --- REFINED HEAT PROOFING ---
        if original_class == "Built-up" or is_urban_osm:
            print("🏙️  Confirmed Urban Area (No override)")
            data['class'] = "Built-up"
            data['suitability'] = 0.05
        elif data['ndvi'] <= 0.16:
            print("🌵 Confirmed Barren/Desert Area (Override Triggered)")
            data['class'] = "Bare/Sparse Vegetation"
            data['suitability'] = 1.0

        ssi, components = self.calculate_ssi(data)

        if ssi > 0.75: status = "🟢 HIGH PRIORITY"
        elif ssi > 0.50: status = "🟡 SUITABLE"
        else: status = "🔴 LOW PRIORITY"

        print(f"\n🚀 RESULTS: {name}")
        print(f"------------------------------")
        print(f"📋 Status: {status}")
        print(f"🏞️  Type: {data['class']}")
        print(f"🌱 NDVI: {data['ndvi']:.3f} | Water: {data['water_dist']}m")
        print(f"🏆 SSI: {ssi}")
        print(f"📊 AHP: LULC:{components['lulc']} | NDVI:{components['ndvi']} | H2O:{components['water']:.2f}")
        print(f"------------------------------")

        return ssi

if __name__ == "__main__":
    scout = SiteScouterV2()
    
    # 1. Test the City again (Bandra)
    print("Testing Mumbai...")
    scout.analyze_site(19.054, 72.84, "Mumbai Test")
    
    print("\n" + "="*40 + "\n")
    
    # 2. Test the Desert (Thar Desert, near Jaisalmer)
    print("Testing Thar Desert...")
    scout.analyze_site(26.912, 70.912, "Desert Test")

    scout.analyze_site(27.025, 71.050, "Thar Restoration Site")