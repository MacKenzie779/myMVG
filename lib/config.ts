// Configuration for API endpoints
export const API_CONFIG = {
  // Use environment variables with fallbacks
  DEPARTURES_URL: process.env.NEXT_PUBLIC_DEPARTURES_API || "https://www.mvg.de/api/bgw-pt/v3/departures",
  NEWS_URL: process.env.NEXT_PUBLIC_NEWS_API || "https://www.mvg.de/api/bgw-pt/v3/messages",
  SEARCH_URL: "https://www.mvg.de/api/bgw-pt/v3/locations",

  // Add any API keys or headers needed
  HEADERS: {
    "Content-Type": "application/json",
    // Add API key if provided
    ...(process.env.NEXT_PUBLIC_API_KEY && {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
    }),
  },

  // CORS settings
  CORS_MODE: "cors" as RequestMode,

  // Request timeout (30 seconds)
  TIMEOUT: 30000,
}

// Helper function to create fetch with timeout
export const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}


// Helper function to build search URL
export const buildSearchUrl = (query: string) => {
  const url = new URL(API_CONFIG.SEARCH_URL)
  url.searchParams.set("query", query)
  url.searchParams.set("locationTypes", "STATION")
  return url.toString()
}

// Helper function to build departures URL
export const buildDeparturesUrl = (globalId: string) => {
  const url = new URL(API_CONFIG.DEPARTURES_URL)
  url.searchParams.set("globalId", globalId)
  return url.toString()
}

// Helper function to build news API URL (if it supports station filtering)
export const buildNewsUrl = (station?: string, direction?: string) => {
  const url = new URL(API_CONFIG.NEWS_URL)
  return url.toString()
}
