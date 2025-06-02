"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Train, Users, AlertCircle, ChevronDown, ChevronUp, Info } from "lucide-react"
import { API_CONFIG, fetchWithTimeout, buildNewsUrl } from "@/lib/config"
import { StationService, type StationLocation, type Departure } from "@/lib/station-service"
import { DebugInfo } from "@/components/debug-info"
import { StationSelector } from "@/components/station-selector"
import { useSearchParams, useRouter } from "next/navigation"

interface DepartureDisplay extends Departure {
  minutesUntilDeparture: number
}

interface NewsItem {
  title: string
  description: string
  publication: number
  publicationDuration: {
    from: number
    to: number
  }
  incidentDurations: Array<{
    from: number
    to: number
  }>
  validFrom: number
  validTo: number
  type: string
  provider: string
  links: any[]
  lines: Array<{
    label: string
    transportType: string
    network: string
    divaId: string
    sev: boolean
  }>
  stationGlobalIds: string[]
  eventTypes: any[]
}

export default function UBahnDepartures() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get station and direction from URL search parameters
  const station = searchParams.get("station")
  const direction = searchParams.get("direction")

  const [departures, setDepartures] = useState<DepartureDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [showAllDepartures, setShowAllDepartures] = useState(false)
  const [news, setNews] = useState<NewsItem[]>([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [newsError, setNewsError] = useState<string | null>(null)
  const [currentStationData, setCurrentStationData] = useState<StationLocation | null>(null)

  const handleStationChange = useCallback(
    (newStation?: string, newDirection?: string) => {
      const params = new URLSearchParams()

      if (newStation) {
        params.set("station", newStation)
      }

      if (newDirection) {
        params.set("direction", newDirection)
      }

      const queryString = params.toString()
      const newUrl = queryString ? `/?${queryString}` : "/"

      router.push(newUrl)
    },
    [router],
  )

  const fetchDepartures = useCallback(async () => {
    try {
      setError(null)

      if (!station) {
        // If no station is selected, show empty state
        setDepartures([])
        setLoading(false)
        return
      }

      // First, search for the station to get its globalId
      const stationData = await StationService.getStationByName(station)
      if (!stationData) {
        throw new Error(`Station "${station}" not found`)
      }

      setCurrentStationData(stationData)

      // Then fetch departures using the globalId
      const departuresData = await StationService.getDepartures(stationData.globalId)

      // Filter by direction if specified and calculate time until departure
      let filteredDepartures = departuresData
      if (direction) {

        if (direction.toLowerCase().includes("ga") || direction.toLowerCase().includes("fo") || direction.toLowerCase().includes("gf") || direction.toLowerCase().includes("gfz")) {
            filteredDepartures = departuresData.filter((departure) =>
                departure.lineId?.includes("G:R"),
            )
        }
        
        if (direction.toLowerCase().includes("kl")) {
            filteredDepartures = departuresData.filter((departure) =>
                departure.lineId?.includes("G:H"),
            )
        }
      }

      const departuresWithTime = filteredDepartures
        .map((departure) => ({
          ...departure,
          minutesUntilDeparture: Math.max(0, Math.floor((departure.realtimeDepartureTime - Date.now()) / 60000)),
        }))
        .sort((a, b) => a.realtimeDepartureTime - b.realtimeDepartureTime)

      setDepartures(departuresWithTime)
      setLastUpdated(new Date())
      setLoading(false)
    } catch (err) {
      console.error("Departures fetch error:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch departures")
      setLoading(false)
    }
  }, [station, direction])

  const fetchNews = useCallback(async () => {
    try {
      setNewsError(null)
      const apiUrl = buildNewsUrl(station || undefined, direction || undefined)

      const response = await fetchWithTimeout(apiUrl, {
        headers: API_CONFIG.HEADERS,
        mode: API_CONFIG.CORS_MODE,
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`)
      }

      const data: NewsItem[] = await response.json()

      // Filter for news that affects U6 line
      const u6News = data.filter((newsItem) => newsItem.lines && newsItem.lines.some((line) => line.label === "U6"))

      setNews(u6News)
      setNewsLoading(false)
    } catch (err) {
      console.error("News fetch error:", err)
      setNewsError(err instanceof Error ? err.message : "Failed to fetch news")
      setNewsLoading(false)
    }
  }, [station, direction])

  // Update time until departure every second
  useEffect(() => {
    const interval = setInterval(() => {
      setDepartures((prev) =>
        prev.map((departure) => ({
          ...departure,
          minutesUntilDeparture: Math.max(0, Math.floor((departure.realtimeDepartureTime - Date.now()) / 60000)),
        })),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Fetch data every minute and when station/direction changes
  useEffect(() => {
    setLoading(true)
    setNewsLoading(true)
    fetchDepartures()
    fetchNews()
    const interval = setInterval(() => {
      fetchDepartures()
      fetchNews()
    }, 60000)
    return () => clearInterval(interval)
  }, [fetchDepartures, fetchNews])

  const getOccupancyColor = (occupancy: string) => {
    switch (occupancy) {
      case "LOW":
        return "bg-green-100 text-green-800"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800"
      case "HIGH":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getOccupancyIcon = (occupancy: string) => {
    switch (occupancy) {
      case "LOW":
        return "🟢"
      case "MEDIUM":
        return "🟡"
      case "HIGH":
        return "🔴"
      default:
        return "⚪"
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ")
  }

  const formatNewsDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const displayedDepartures = showAllDepartures ? departures : departures.slice(0, 3)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Train className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">
            {station ? `Loading departures for ${station}...` : "Loading U-Bahn departures..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Train className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            {currentStationData?.name}
            {direction != null && (
                <> – Richtung {direction}</>
            )}
          </h1>
          {lastUpdated && (
            <p className="text-xs md:text-sm text-gray-600 flex items-center gap-1">
              <Clock className="w-3 h-3 md:w-4 md:h-4" />
              Last updated: {lastUpdated.toLocaleTimeString("de-DE")}
            </p>
          )}
        </div>

        <StationSelector currentStation={station} currentDirection={direction} onStationChange={handleStationChange} />

        <DebugInfo station={station} direction={direction} globalId={currentStationData?.globalId} />

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span>Error: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {!station ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Train className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Station</h3>
              <p className="text-gray-600 mb-4">Choose a U-Bahn station to see U6 line departures</p>
              <p className="text-sm text-gray-500">
                Use the station selector above to search for stations like "Marienplatz", "Universität", or "Garching"
              </p>
            </CardContent>
          </Card>
        ) : departures.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Train className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No U6 departures available for {currentStationData?.name || station}
                {direction && ` towards ${direction}`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-2 md:space-y-3">
              {displayedDepartures.map((departure, index) => (
                <Card
                  key={`${departure.label}-${departure.realtimeDepartureTime}-${index}`}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-3 md:p-4">
                    {/* Mobile Layout */}
                    <div className="block md:hidden">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 font-semibold text-xs">
                            {departure.label}
                          </Badge>
                          {departure.cancelled && (
                            <Badge variant="destructive" className="text-xs">
                              Cancelled
                            </Badge>
                          )}
                          {departure.delayInMinutes > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              +{departure.delayInMinutes}m
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-blue-600">{departure.minutesUntilDeparture}m</div>
                          <div className="text-xs text-gray-600">{formatTime(departure.realtimeDepartureTime)}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{departure.destination}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-600">
                              Platform {departure.platform || "N/A"}
                              {departure.platformChanged && <span className="text-red-600 ml-1">*</span>}
                            </span>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <Badge className={`text-xs ${getOccupancyColor(departure.occupancy)}`}>
                                {getOccupancyIcon(departure.occupancy)} {departure.occupancy}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:grid md:grid-cols-6 gap-4 items-center">
                      {/* Line and Destination */}
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 font-semibold">
                            {departure.label}
                          </Badge>
                          {departure.cancelled && <Badge variant="destructive">Cancelled</Badge>}
                        </div>
                        <p className="font-medium text-gray-900">{departure.destination}</p>
                      </div>

                      {/* Platform */}
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Platform</p>
                        <p className="font-semibold text-lg">
                          {departure.platform || "N/A"}
                          {departure.platformChanged && <span className="text-red-600 ml-1">*</span>}
                        </p>
                      </div>

                      {/* Time */}
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Departure</p>
                        <p className="font-semibold text-lg">{formatTime(departure.realtimeDepartureTime)}</p>
                      </div>

                      {/* Minutes Until Departure */}
                      <div className="text-center">
                        <p className="text-sm text-gray-600">In</p>
                        <p className="font-bold text-xl text-blue-600">{departure.minutesUntilDeparture}m</p>
                      </div>

                      {/* Delay and Occupancy */}
                      <div className="text-center space-y-2">
                        {departure.delayInMinutes > 0 && (
                          <Badge variant="destructive" className="block">
                            +{departure.delayInMinutes}m delay
                          </Badge>
                        )}
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-4 h-4" />
                          <Badge className={getOccupancyColor(departure.occupancy)}>
                            {getOccupancyIcon(departure.occupancy)} {departure.occupancy}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Show More/Less Button */}
            {departures.length > 3 && (
              <div className="text-center mt-3 md:mt-4">
                <button
                  onClick={() => setShowAllDepartures(!showAllDepartures)}
                  className="inline-flex items-center gap-2 px-3 py-2 md:px-4 text-xs md:text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  {showAllDepartures ? (
                    <>
                      <ChevronUp className="w-3 h-3 md:w-4 md:h-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
                      Show More ({departures.length - 3} more)
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* News Section */}
        <div className="mt-6 md:mt-12">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
            <Info className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
            U6 Line News & Updates
          </h2>

          {newsError && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <span>Error loading news: {newsError}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {newsLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Info className="w-8 h-8 animate-pulse mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Loading news...</p>
              </CardContent>
            </Card>
          ) : news.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No current news for U6 line</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {news.map((newsItem, index) => (
                <Card
                  key={`${newsItem.title}-${newsItem.publication}-${index}`}
                  className="border-l-4 border-l-orange-500"
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start justify-between mb-2 md:mb-3">
                      <Badge
                        variant="outline"
                        className={`text-xs md:text-sm ${
                          newsItem.type === "INCIDENT"
                            ? "bg-red-100 text-red-800 border-red-300"
                            : "bg-orange-100 text-orange-800 border-orange-300"
                        }`}
                      >
                        {newsItem.type === "INCIDENT" ? "Incident" : "Schedule Change"}
                      </Badge>
                      <span className="text-xs md:text-sm text-gray-500">{formatNewsDate(newsItem.publication)}</span>
                    </div>

                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">{newsItem.title}</h3>

                    <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3 md:mb-4">
                      {stripHtml(newsItem.description)}
                    </p>

                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Provider:</span>
                        <span>{newsItem.provider}</span>
                      </div>
                      {newsItem.validTo > Date.now() && (
                        <div className="flex items-center gap-2">
                          <span className="hidden md:inline mx-2">•</span>
                          <span className="font-medium">Valid until:</span>
                          <span>{formatNewsDate(newsItem.validTo)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
