import { API_CONFIG, fetchWithTimeout, buildSearchUrl, buildDeparturesUrl } from "./config"

export interface StationLocation {
  type: string
  latitude: number
  longitude: number
  place: string
  name: string
  globalId: string
  divaId: number
  hasZoomData: boolean
  transportTypes: string[]
  aliases: string
  tariffZones: string
}

export interface Departure {
  plannedDepartureTime: number
  realtime: boolean
  delayInMinutes: number
  realtimeDepartureTime: number
  transportType: string
  label: string
  destination: string
  cancelled: boolean
  platform?: number
  platformChanged?: boolean
  occupancy: string
  lineId?: string
}

export class StationService {
  // Search for stations by name
  static async searchStations(query: string): Promise<StationLocation[]> {
    if (!query.trim()) {
      return []
    }

    try {
      const searchUrl = buildSearchUrl(query)
      const response = await fetchWithTimeout(searchUrl, {
        headers: API_CONFIG.HEADERS,
        mode: API_CONFIG.CORS_MODE,
      })

      if (!response.ok) {
        throw new Error(`Failed to search stations: ${response.status} ${response.statusText}`)
      }

      const data: StationLocation[] = await response.json()
      // Filter for stations that have UBAHN transport type
      return data.filter((station) => station.transportTypes.includes("UBAHN"))
    } catch (error) {
      console.error("Station search error:", error)
      throw error
    }
  }

  // Get departures for a specific station by globalId
  static async getDepartures(globalId: string): Promise<Departure[]> {
    try {
      const departuresUrl = buildDeparturesUrl(globalId)
      console.log(departuresUrl)
      const response = await fetchWithTimeout(departuresUrl, {
        headers: API_CONFIG.HEADERS,
        mode: API_CONFIG.CORS_MODE,
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch departures: ${response.status} ${response.statusText}`)
      }

      const data: Departure[] = await response.json()

      // Filter for U6 line specifically
      return data.filter(
        (departure) => departure.transportType === "UBAHN" && departure.lineId && departure.lineId.includes("010U6"),
      )
    } catch (error) {
      console.error("Departures fetch error:", error)
      throw error
    }
  }

  // Get station by name (returns first UBAHN station match)
  static async getStationByName(stationName: string): Promise<StationLocation | null> {
    try {
      const stations = await this.searchStations(stationName)
      return stations.length > 0 ? stations[0] : null
    } catch (error) {
      console.error("Get station by name error:", error)
      return null
    }
  }
}
