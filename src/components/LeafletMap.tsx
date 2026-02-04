"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icons in Next.js
const fixLeafletIcons = () => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
};

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position === null ? null : (
        <Marker position={position}>
            <Popup>Selected Location</Popup>
        </Marker>
    );
}

interface LeafletMapProps {
    onLocationSelect: (lat: number, lng: number) => void;
    showHeatmap?: boolean;
}

export default function LeafletMap({
    onLocationSelect,
    showHeatmap = true
}: LeafletMapProps) {
    const [suitabilityTileUrl, setSuitabilityTileUrl] = useState<string | null>(null);

    useEffect(() => {
        fixLeafletIcons();

        // Fetch India suitability heat map tiles
        const fetchSuitabilityTiles = async () => {
            try {
                const response = await fetch(
                    "https://proglottidean-addyson-malapertly.ngrok-free.dev/api/map/india-suitability",
                    {
                        headers: {
                            "ngrok-skip-browser-warning": "true"
                        }
                    }
                );
                const data = await response.json();
                if (data.status === "success" && data.tile_url) {
                    setSuitabilityTileUrl(data.tile_url);
                }
            } catch (error) {
                console.error("Failed to fetch suitability tiles:", error);
            }
        };

        fetchSuitabilityTiles();
    }, []);

    return (
        <MapContainer
            center={[20.5937, 78.9629]} // India Center
            zoom={5}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {showHeatmap && suitabilityTileUrl && (
                <TileLayer
                    url={suitabilityTileUrl}
                    attribution="Google Earth Engine | AgriQCert"
                    opacity={0.7}
                />
            )}
            <LocationMarker onLocationSelect={onLocationSelect} />
        </MapContainer>
    );
}

