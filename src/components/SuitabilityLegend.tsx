"use client";

// Legend component for suitability index - separate file to avoid SSR issues with Leaflet
export function SuitabilityLegend() {
    return (
        <div className="flex items-center gap-3 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200">
            <span className="text-xs font-semibold text-gray-700">Suitability:</span>
            <div className="flex items-center gap-2">
                <div
                    className="w-24 h-2.5 rounded-sm"
                    style={{
                        background: "linear-gradient(to right, #d73027, #fc8d59, #fee08b, #d9ef8b, #91cf60, #1a9850)"
                    }}
                />
                <div className="flex gap-4 text-[10px] text-gray-600">
                    <span>Low</span>
                    <span>High</span>
                </div>
            </div>
        </div>
    );
}
