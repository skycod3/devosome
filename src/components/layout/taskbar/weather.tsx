import { useEffect, useState } from "react";
import Image from "next/image";

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  location: string;
}

interface WeatherApiResponse {
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
  };
  location: {
    name: string;
  };
}

// cache for geolocation coordinates to avoid repeated prompts and improve performance
let cachedCoords: { latitude: number; longitude: number } | null = null;

export function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // check if geolocation is available
        if (!navigator.geolocation) {
          setError("Geolocation not available");
          setLoading(false);
          return;
        }

        // use cached coordinates if available, otherwise fetch new ones
        const getCoords = (): Promise<GeolocationCoordinates> => {
          if (cachedCoords) {
            return Promise.resolve({
              latitude: cachedCoords.latitude,
              longitude: cachedCoords.longitude,
            } as GeolocationCoordinates);
          }

          return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                cachedCoords = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                };
                resolve(position.coords);
              },
              (error) => reject(error),
              { timeout: 10000 },
            );
          });
        };

        const coords = await getCoords();
        const { latitude, longitude } = coords;

        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=${latitude},${longitude}&aqi=no`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const data: WeatherApiResponse = await response.json();

        setWeather({
          temp: Math.round(data.current.temp_c),
          condition: data.current.condition.text,
          icon: `https:${data.current.condition.icon}`,
          location: data.location.name,
        });
        setError(null);
      } catch (error) {
        console.error("Weather fetch error:", error);

        if (error instanceof GeolocationPositionError) {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setError("Permission denied");
              break;
            case error.POSITION_UNAVAILABLE:
              setError("Position unavailable");
              break;
            case error.TIMEOUT:
              setError("Timeout");
              break;
          }
        } else {
          setError("Error loading weather");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    // Update every 10 minutes
    const updateInterval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(updateInterval);
  }, []);

  if (loading) {
    return (
      <div
        className="text-foreground flex items-center gap-2 text-sm"
        role="status"
        aria-label="Loading weather"
      >
        <div className="size-5 animate-pulse rounded-full bg-foreground/20" />
        <div className="h-4 w-6 animate-pulse rounded bg-foreground/20" />
        <div className="h-3 w-16 animate-pulse rounded bg-foreground/20" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="text-foreground/50 text-xs"
        role="alert"
        aria-label="Error loading weather"
      >
        {error}
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div
      className="text-foreground flex items-center gap-2 text-sm"
      role="status"
      aria-label={`Weather: ${weather.temp} degrees Celsius in ${weather.location}`}
    >
      <Image
        src={weather.icon}
        alt={weather.condition}
        width={24}
        height={24}
        unoptimized // Necessary for external WeatherAPI icons
      />
      <span className="font-bold">{weather.temp}°C</span>
      <span className="text-xs opacity-75">{weather.location}</span>
    </div>
  );
}
