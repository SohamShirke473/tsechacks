import requests
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

class EarlyWarningSystem:
    def __init__(self):
        self.api_url = "https://archive-api.open-meteo.com/v1/archive"
        
        # Comprehensive Knowledge Base (Biological Boundaries)
        self.KNOWLEDGE_BASE = {
            "Neem": { "max_temp": 45, "min_temp": 5, "water_needs": "Low", "max_annual_rain": 2500, "vulnerability": 0.2 },
            "Tulsi": { "max_temp": 35, "min_temp": 10, "water_needs": "Moderate", "max_annual_rain": 2000, "vulnerability": 0.4 },
            "Bamboo": { "max_temp": 38, "min_temp": 15, "water_needs": "High", "max_annual_rain": 5000, "vulnerability": 0.6 },
            "Mango": { "max_temp": 42, "min_temp": 10, "water_needs": "Moderate", "max_annual_rain": 2500, "vulnerability": 0.4 },
            "Rose": { "max_temp": 30, "min_temp": 10, "water_needs": "Moderate", "max_annual_rain": 1500, "vulnerability": 0.8 },
            "Cactus": { "max_temp": 50, "min_temp": 10, "water_needs": "Low", "max_annual_rain": 1000, "vulnerability": 0.1 },
            "Fern": { "max_temp": 30, "min_temp": 10, "water_needs": "High", "max_annual_rain": 4000, "vulnerability": 0.7 },
            "Lavender": { "max_temp": 35, "min_temp": 5, "water_needs": "Low", "max_annual_rain": 1200, "vulnerability": 0.3 },
            "Blueberry": { "max_temp": 30, "min_temp": -5, "water_needs": "Moderate", "max_annual_rain": 2000, "vulnerability": 0.5 },
            "Teak": { "max_temp": 40, "min_temp": 15, "water_needs": "Moderate", "max_annual_rain": 3000, "vulnerability": 0.7 }
        }

    def fetch_multi_year_data(self, lat, lon):
        """
        Fetches 3 full years of daily weather data (Temperature & Rain).
        """
        end_date = datetime.now().date() - timedelta(days=2)
        start_date = end_date - timedelta(days=1095) # 3 Years of Data
        
        params = {
            "latitude": lat, "longitude": lon,
            "start_date": start_date, "end_date": end_date,
            "daily": ["temperature_2m_max", "precipitation_sum", "temperature_2m_min"],
            "timezone": "auto"
        }
        try:
            response = requests.get(self.api_url, params=params, timeout=15)
            if response.status_code == 200:
                return response.json().get('daily', {})
            return None
        except Exception as e:
            print(f"Error fetching weather data: {e}")
            return None

    def analyze_everything(self, lat, lon, species_name):
        print(f"🔍 Analyzing 3-Year Time Series for {species_name}...")
        
        # 1. FETCH 3-YEAR DATA
        data = self.fetch_multi_year_data(lat, lon)
        if not data: return None

        plant = self.KNOWLEDGE_BASE.get(species_name)
        if not plant: return {"error": f"Species '{species_name}' not found."}

        # Convert to Pandas / Numpy for Time Series Math
        dates = data['time']
        temp_max = np.array(data['temperature_2m_max'])
        rain_sum = np.array(data['precipitation_sum'])
        
        # Handle possible None values in API response
        # (Simple fill with 0 or mean for robustness)
        temp_max = np.array([t if t is not None else 30 for t in temp_max])
        rain_sum = np.array([r if r is not None else 0 for r in rain_sum])

        # --- 2. TIME SERIES: DETECTING VIOLATIONS OVER TIME ---
        # We calculate how many days *per year* exceeded the plant's limit.
        # This detects if the site is getting worse (Climate Change Trend).
        
        limit_violations = [] # Store dates where max_temp was exceeded
        violation_counts = {"Year 1": 0, "Year 2": 0, "Year 3": 0}
        
        # Split into approx 3 years chunks (365 days)
        # We iterate backwards to define Year 1 as "Most Recent"
        total_days = len(temp_max)
        
        for i in range(total_days):
            current_temp = temp_max[i]
            current_date = dates[i]
            
            # Check violation
            if current_temp > plant['max_temp']:
                limit_violations.append({
                    "date": current_date, 
                    "temp": current_temp, 
                    "limit": plant['max_temp']
                })
                
                # Assign to specific year bucket for trend analysis
                if i > (total_days - 365):
                    violation_counts["Year 3 (Recent)"] = violation_counts.get("Year 3 (Recent)", 0) + 1
                elif i > (total_days - 730):
                    violation_counts["Year 2"] = violation_counts.get("Year 2", 0) + 1
                else:
                    violation_counts["Year 1 (Oldest)"] = violation_counts.get("Year 1 (Oldest)", 0) + 1

        # --- 3. VOLATILITY & TREND CALCULATION ---
        # Is the site becoming more dangerous?
        recent_stress = violation_counts.get("Year 3 (Recent)", 0)
        old_stress = violation_counts.get("Year 1 (Oldest)", 0)
        
        trend = "STABLE"
        if recent_stress > old_stress + 5: trend = "WORSENING 🔴"
        elif recent_stress < old_stress - 5: trend = "IMPROVING 🟢"

        # --- 4. SURVIVAL PROBABILITY (Weighted by Recency) ---
        # Recent heatwaves hurt survival chances more than old ones
        yearly_rain = np.sum(rain_sum) / 3 # Average annual rain
        
        # Penalty for heat violations (weighted towards recent years)
        heat_penalty = (recent_stress * 0.02) + (old_stress * 0.01)
        
        # Penalty for drought (if high water needs)
        water_penalty = 0
        if plant['water_needs'] == "High" and yearly_rain < 1000:
            water_penalty = 0.3
            
        survival_prob = max(0.05, 1.0 - (heat_penalty + water_penalty))

        # --- 5. PREPARE FRONTEND GRAPH DATA ---
        # We perform 'resampling' to monthly averages to make the graph clean (not 1000 points)
        # Using simple binning for performance
        monthly_chart_data = []
        for i in range(0, total_days, 30): # Monthly steps
            if i+30 < total_days:
                chunk_temp = temp_max[i:i+30]
                chunk_rain = rain_sum[i:i+30]
                monthly_chart_data.append({
                    "month_index": i // 30,
                    "date": dates[i],
                    "avg_temp": round(float(np.mean(chunk_temp)), 1),
                    "total_rain": round(float(np.sum(chunk_rain)), 1),
                    "temp_limit": plant['max_temp'] # Useful for drawing a red threshold line
                })

        return {
            "metadata": {
                "species": species_name,
                "analysis_duration": "3 Years (1095 Days)",
                "trend_status": trend
            },
            "long_term": {
                "survival_probability_3yr": round(survival_prob, 2),
                "heat_stress_trend": violation_counts,
                "average_annual_rainfall": round(yearly_rain, 1),
                "primary_threat": "Rising Heat Frequency" if trend == "WORSENING 🔴" else "None"
            },
            "time_series_graph": {
                "description": "Monthly aggregated averages for the last 3 years.",
                "data_points": monthly_chart_data
            }
        }

# --- TEST BLOCK ---
if __name__ == "__main__":
    import json
    ews = EarlyWarningSystem()
    # Test with Jodhpur (Hot) for a sensitive plant
    report = ews.analyze_everything(26.23, 73.02, "Fern")
    print(json.dumps(report, indent=2))