import json
import os
from datetime import datetime

class HistoryManager:
    def __init__(self, filename="site_audit_log.json"):
        self.filename = filename
        # Initialize file if it doesn't exist
        if not os.path.exists(self.filename):
            with open(self.filename, 'w') as f:
                json.dump({}, f)

    def log_audit(self, lat, lon, species, data):
        """
        Saves the 'Continuous Health Audit' to a permanent JSON log.
        Fulfills: "Track land-health indicators over time"
        """
        site_key = f"{lat}_{lon}_{species}"
        
        try:
            with open(self.filename, 'r') as f:
                history = json.load(f)
        except:
            history = {}
        
        if site_key not in history:
            history[site_key] = []
            
        # Create a time-stamped snapshot
        snapshot = {
            "timestamp": datetime.now().isoformat(),
            "vegetation_density_ndvi": data['health_analytics']['current_ndvi'],
            "restoration_velocity_rpi": data['health_analytics']['restoration_index'],
            "carbon_stored_kg": data['carbon_trajectory'][-1]['stored_kg']
        }
        
        history[site_key].append(snapshot)
        
        with open(self.filename, 'w') as f:
            json.dump(history, f, indent=2)

    def get_history(self, lat, lon, species):
        """Returns the full timeline for frontend charts"""
        site_key = f"{lat}_{lon}_{species}"
        with open(self.filename, 'r') as f:
            history = json.load(f)
        return history.get(site_key, [])