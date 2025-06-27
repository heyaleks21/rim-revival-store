"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  MapPin,
  Clock,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface WeatherData {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  location: string
  icon: string
}

interface City {
  name: string
  displayName: string
  state: string
}

const australianCities: City[] = [
  { name: "Adelaide", displayName: "Adelaide", state: "SA" },
  { name: "Sydney", displayName: "Sydney", state: "NSW" },
  { name: "Melbourne", displayName: "Melbourne", state: "VIC" },
  { name: "Brisbane", displayName: "Brisbane", state: "QLD" },
  { name: "Perth", displayName: "Perth", state: "WA" },
  { name: "Darwin", displayName: "Darwin", state: "NT" },
  { name: "Hobart", displayName: "Hobart", state: "TAS" },
  { name: "Canberra", displayName: "Canberra", state: "ACT" },
]

export function WeatherTimeCard() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedCity, setSelectedCity] = useState<string>("Adelaide")
  const [error, setError] = useState<string | null>(null)

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true)
      setError(null)

      try {
        // Call our secure server-side API route instead of directly calling OpenWeather
        const response = await fetch(`/api/weather?city=${encodeURIComponent(selectedCity)}`)

        if (!response.ok) {
          throw new Error(`Weather API error: ${response.status}`)
        }

        const data = await response.json()

        const selectedCityObj = australianCities.find((city) => city.name === selectedCity)
        const locationDisplay = selectedCityObj
          ? `${selectedCityObj.displayName}, ${selectedCityObj.state}`
          : selectedCity

        setWeather({
          temperature: Math.round(data.main.temp),
          condition: data.weather[0]?.main || "Unknown",
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
          location: locationDisplay,
          icon: data.weather[0]?.icon || "",
        })
      } catch (err) {
        console.error("Error fetching weather:", err)
        setError("Unable to fetch weather data")
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [selectedCity])

  const getWeatherIcon = (condition: string | undefined, icon: string | undefined) => {
    // Add null/undefined check
    if (!condition) return <Cloud className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />

    // Check if it's night (n in the icon)
    const isNight = icon?.includes("n") || false

    // First check the condition
    switch (condition.toLowerCase()) {
      case "clear":
        return isNight ? (
          <Sun className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-300" />
        ) : (
          <Sun className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
        )
      case "rain":
        return <CloudRain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
      case "clouds":
        return <Cloud className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
      case "snow":
        return <CloudSnow className="h-6 w-6 sm:h-8 sm:w-8 text-blue-200" />
      case "thunderstorm":
        return <CloudLightning className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
      case "drizzle":
        return <CloudDrizzle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
      case "mist":
      case "fog":
      case "haze":
        return <CloudFog className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300" />
      default:
        return <Cloud className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-AU", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const handleCityChange = (value: string) => {
    setSelectedCity(value)
  }

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="flex items-center justify-between text-base md:text-lg">
          <span>Local Time & Weather</span>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold">{formatTime(currentTime)}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{formatDate(currentTime)}</p>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-xs sm:text-sm text-muted-foreground">
                {loading ? <Skeleton className="h-4 w-24" /> : weather?.location}
              </span>
            </div>
          </div>

          <div className="w-full">
            <Select value={selectedCity} onValueChange={handleCityChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a city" />
              </SelectTrigger>
              <SelectContent>
                {australianCities.map((city) => (
                  <SelectItem key={city.name} value={city.name}>
                    {city.displayName}, {city.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-20 sm:h-6 sm:w-24" />
                <Skeleton className="h-3 w-24 sm:h-4 sm:w-32" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500 text-sm">{error}</div>
          ) : (
            <div className="flex items-center justify-between border-t pt-3">
              <div className="flex items-center">
                {getWeatherIcon(weather?.condition, weather?.icon)}
                <div className="ml-2 sm:ml-3">
                  <h4 className="text-lg sm:text-xl font-semibold">{weather?.temperature}°C</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{weather?.condition || "Unknown"}</p>
                </div>
              </div>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-xs sm:text-sm">
                  <Droplets className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 mr-1" />
                  <span>{weather?.humidity || 0}% Humidity</span>
                </div>
                <div className="flex items-center text-xs sm:text-sm">
                  <Wind className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mr-1" />
                  <span>{weather?.windSpeed || 0} km/h Wind</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
