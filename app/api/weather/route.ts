import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")

    if (!city) {
      return NextResponse.json({ error: "City parameter is required" }, { status: 400 })
    }

    const apiKey = process.env.OPENWEATHER_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Weather API configuration error" }, { status: 500 })
    }

    const formattedCity = `${city},AU`
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(formattedCity)}&units=metric&appid=${apiKey}`,
      { cache: "no-store" },
    )

    if (!response.ok) {
      return NextResponse.json({ error: `Weather API error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}
