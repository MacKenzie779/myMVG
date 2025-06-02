"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"

export function useUrlParams() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Extract station and direction from URL path segments
  const pathSegments = pathname.split("/").filter(Boolean)
  const station = pathSegments[0] || null
  const direction = pathSegments[1] || null

  // Get query parameters
  const queryStation = searchParams.get("station")
  const queryDirection = searchParams.get("direction")

  // Prefer path parameters over query parameters
  const finalStation = station || queryStation
  const finalDirection = direction || queryDirection

  const updateParams = useCallback(
    (newStation?: string, newDirection?: string) => {
      const segments = []
      if (newStation) segments.push(newStation)
      if (newDirection) segments.push(newDirection)

      const newPath = segments.length > 0 ? `/${segments.join("/")}` : "/"
      router.push(newPath)
    },
    [router],
  )

  return {
    station: finalStation,
    direction: finalDirection,
    updateParams,
  }
}
