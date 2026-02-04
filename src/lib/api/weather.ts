
export interface WeatherData {
    temp: number; // Celsius
    humidity: number; // %
    rainfall: number; // mm in last 3h
    pressure: number; // hPa
    clouds: number; // %
    description: string;
}

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
    const apiKey = process.env.OPEN_WEATHER || "4744e9ac120fe1244714e5e06841893c";
    if (!apiKey) {
        console.warn("OPEN_WEATHER key missing");
        throw new Error("Missing OpenWeatherMap API Key");
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Weather API Error: ${res.statusText}`);
        }

        const data = await res.json();

        return {
            temp: data.main.temp,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            rainfall: data.rain ? (data.rain["1h"] || data.rain["3h"] || 0) : 0,
            clouds: data.clouds.all,
            description: data.weather[0].description
        };
    } catch (error) {
        console.error("Failed to fetch weather data:", error);
        return {
            temp: 25,
            humidity: 50,
            rainfall: 0,
            pressure: 1013,
            clouds: 20,
            description: "Data unavailable"
        };
    }
}
