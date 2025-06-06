"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Settings, Search, Loader2, X } from "lucide-react"
import { StationService, type StationLocation } from "@/lib/station-service"

interface StationSelectorProps {
  currentStation?: string | null
  currentDirection?: string | null
  onStationChange: (station?: string, direction?: string) => void
}

export function StationSelector({ currentStation, currentDirection, onStationChange }: StationSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDirectionSelector, setIsDirectionSelector] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<StationLocation[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedStation, setSelectedStation] = useState<StationLocation | null>(null)

  // Common U6 directions
  const directions = ["Klinikum Großhadern", "Garching-Forschungszentrum"]

  // Search for stations when query changes
  const searchStations = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await StationService.searchStations(query)
      setSearchResults(results)
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchStations(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchStations])

  // Load current station details if we have a station name
  useEffect(() => {
    if (currentStation && !selectedStation) {
      StationService.getStationByName(currentStation).then((station) => {
        if (station) {
          setSelectedStation(station)
        }
      })
    }
  }, [currentStation, selectedStation])

  const handleStationSelect = (station: StationLocation, direction?: string) => {
    setSelectedStation(station)
    onStationChange(station.name, direction)
    setIsExpanded(false)
    setIsDirectionSelector(false)
    setSearchQuery("")
    setSearchResults([])
  }

  const handleDirectionChange = (direction?: string) => {
    if (selectedStation) {
      onStationChange(selectedStation.name, direction)
    }
    setIsDirectionSelector(false)
  }

  const handleClearStation = () => {
    setSelectedStation(null)
    onStationChange(undefined, undefined)
    setIsExpanded(false)
    setIsDirectionSelector(false)
    setSearchQuery("")
    setSearchResults([])
  }

  const openDirectionSelector = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDirectionSelector(true)
    setIsExpanded(true)
  }

  const openStationSelector = () => {
    setIsDirectionSelector(false)
    setIsExpanded(true)
  }

  // Station selector view
  if (isExpanded) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          {selectedStation && (
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Navigation className="w-4 h-4" />
                    Select Direction for {selectedStation.name}
                </h3>
                <button onClick={() => setIsExpanded(false)} className="text-sm text-gray-500 hover:text-gray-700">
                    Close
                </button>
            </div>
          )}
          {!selectedStation && (
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Select Station
                </h3>
                <button onClick={() => setIsExpanded(false)} className="text-sm text-gray-500 hover:text-gray-700">
                    Close
                </button>
            </div>
          )}


          <div className="space-y-4">
                        {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isSearching ? (
                  <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <input
                type="text"
                placeholder="Search for U-Bahn stations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="max-h-64 overflow-y-auto space-y-2">
                <div className="text-sm font-medium text-gray-700 mb-2">Search Results:</div>
                {searchResults.map((station) => (
                  <div key={station.globalId} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-sm">{station.name}</div>
                        <div className="text-xs text-gray-600">{station.place}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {station.transportTypes.map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => handleStationSelect(station)}
                        className="w-full text-left text-xs p-2 rounded transition-colors hover:bg-blue-100"
                      >
                        Select station (all directions)
                      </button>
                      {directions.map((direction) => (
                        <button
                          key={direction}
                          onClick={() => handleStationSelect(station, direction)}
                          className="w-full text-left text-xs p-2 rounded transition-colors flex items-center gap-1 hover:bg-blue-100"
                        >
                          <Navigation className="w-3 h-3" />→ {direction}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {searchQuery && !isSearching && searchResults.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No U-Bahn stations found for "{searchQuery}"</p>
                <p className="text-xs text-gray-400 mt-1">
                  Try searching for "Marienplatz", "Universität", or "Garching"
                </p>
              </div>
            )}
            {/* Current Station Display */}
            {selectedStation && (
              <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                    <div className="space-y-2 w-[90%]">
                    <button
                        onClick={() => handleDirectionChange(undefined)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            !currentDirection ? "border-blue-500 bg-blue-50 text-blue-900" : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                        <div className="font-medium">All directions</div>
                        <div className="text-xs text-gray-600">Show departures in both directions</div>
                    </button>

                    {directions.map((direction) => (
                        <button
                            key={direction}
                            onClick={() => handleDirectionChange(direction)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors flex items-center gap-2 ${
                            currentDirection === direction
                            ? "border-blue-500 bg-blue-50 text-blue-900"
                            : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <Navigation className="w-4 h-4" />
                            <div>
                                <div className="font-medium">→ {direction}</div>
                                <div className="text-xs text-gray-600">Departures towards {direction}</div>
                            </div>
                        </button>
                    ))}
                    </div>
                        <button
                            onClick={handleClearStation}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Clear selection"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}


          </div>
        </CardContent>
      </Card>
    )
  }

  // Collapsed view
  return (
    <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center justify-between" onClick={openStationSelector}>
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {selectedStation ? selectedStation.name : currentStation || "Select Station"}
            </span>
          </div>
          <span className="text-xs text-gray-500">Click to change</span>
        </div>
      </CardContent>
    </Card>
  )
}