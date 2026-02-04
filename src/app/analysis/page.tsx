import SmartSoilDashboard from "@/components/SmartSoilDashboard";

export default function AnalysisPage() {
    return (
        <main className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <header>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Soil & Mineral Intelligence</h1>
                    <p className="text-gray-500">AI-powered site analysis for restoration planning.</p>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 min-h-[600px]">
                    <SmartSoilDashboard />
                </div>
            </div>
        </main>
    );
}
