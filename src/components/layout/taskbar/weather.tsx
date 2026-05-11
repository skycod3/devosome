import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CloudAlert } from "lucide-react";
import { useNotify } from "@/hooks/useNotify";

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

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

export function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useNotify();

  // cache for geolocation coordinates scoped to this component instance
  const coordsRef = useRef<{ latitude: number; longitude: number } | null>(
    null,
  );

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // check if geolocation is available
      if (!navigator.geolocation) {
        setError("Geolocation not available");
        return;
      }

      // use cached coordinates if available, otherwise fetch new ones
      const getCoords = (): Promise<GeolocationCoordinates> => {
        if (coordsRef.current) {
          return Promise.resolve({
            latitude: coordsRef.current.latitude,
            longitude: coordsRef.current.longitude,
          } as GeolocationCoordinates);
        }

        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              coordsRef.current = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              resolve(position.coords);
            },
            (geoError) => reject(geoError),
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
    } catch (err) {
      console.error("Weather fetch error:", err);

      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            if (!sessionStorage.getItem("weatherErrorShown")) {
              sessionStorage.setItem("weatherErrorShown", "true");
              notify.error("Location access is blocked", {
                description:
                  "To enable weather, allow location access in your browser's site settings and reload the page.",
                duration: 10000,
                dedupeId: "weather-location-blocked",
              });
            }

            setError("Permission denied");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Position unavailable");
            break;
          case err.TIMEOUT:
            setError("Timeout");
            break;
        }
      } else {
        setError("Error loading weather");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();

    // Update every 10 minutes
    const updateInterval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(updateInterval);
  }, [fetchWeather]);

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
      <Popover>
        <div
          className="text-foreground/50 text-xs"
          role="alert"
          aria-label="Error loading weather"
        >
          <PopoverTrigger asChild>
            <div
              className="leading-0"
              aria-label={`Error loading weather: ${error}`}
            >
              <button className="rounded p-2">
                <CloudAlert className="size-4" />
              </button>
            </div>
          </PopoverTrigger>

          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>Error</PopoverTitle>
              <PopoverDescription>{error}</PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </div>
      </Popover>
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
      <span className="hidden sm:inline text-xs opacity-75">
        {weather.location}
      </span>
    </div>
  );
}
