// Configuration for API endpoints
export const API_CONFIG = {
  // Use environment variables with fallbacks
  DEPARTURES_URL: process.env.NEXT_PUBLIC_DEPARTURES_API || "https://www.mvg.de/api/bgw-pt/v3/departures?globalId=de:09162:470&limit=100&transportTypes=UBAHN,REGIONAL_BUS,BUS,TRAM,SBAHN",
  NEWS_URL: process.env.NEXT_PUBLIC_NEWS_API || "https://www.mvg.de/api/bgw-pt/v3/messages",

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
