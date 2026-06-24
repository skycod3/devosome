import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for WeatherAPI.com.
 *
 * Keeps `WEATHER_API_KEY` on the server so it never ships in the client bundle.
 * The client sends `lat`/`lon` (from the browser geolocation API) and receives
 * a normalized payload.
 */
export async function GET(request: NextRequest) {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    console.error("Weather route misconfigured: WEATHER_API_KEY is missing.");
    return NextResponse.json(
      { error: "Weather service is not configured." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Missing lat/lon query parameters." },
      { status: 400 },
    );
  }

  try {
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(
      `${lat},${lon}`,
    )}&aqi=no`;

    const response = await fetch(url, { next: { revalidate: 600 } });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch weather data." },
        { status: 502 },
      );
    }

    const data = await response.json();

    return NextResponse.json({
      temp: Math.round(data.current.temp_c),
      condition: data.current.condition.text,
      icon: `https:${data.current.condition.icon}`,
      location: data.location.name,
    });
  } catch (err) {
    console.error("Weather route error:", err);
    return NextResponse.json(
      { error: "Failed to fetch weather data." },
      { status: 500 },
    );
  }
}
