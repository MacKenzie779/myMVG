"use client"

import { buildSearchUrl, buildDeparturesUrl, buildNewsUrl } from "@/lib/config"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DebugInfoProps {
  station?: string | null
  direction?: string | null
  globalId?: string | null
}

export function DebugInfo({ station, direction, globalId }: DebugInfoProps) {
  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  const searchUrl = station ? buildSearchUrl(station) : null
  const departuresUrl = globalId ? buildDeparturesUrl(globalId) : null
  const newsUrl = buildNewsUrl(station || undefined, direction || undefined)

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Development Info</h3>
        <div className="space-y-2 text-sm">
          <div>
            <Badge variant="outline" className="mr-2">
              Station
            </Badge>
            <span className="text-blue-800">{station || "All stations"}</span>
          </div>
          <div>
            <Badge variant="outline" className="mr-2">
              Direction
            </Badge>
            <span className="text-blue-800">{direction || "All directions"}</span>
          </div>
          <div>
            <Badge variant="outline" className="mr-2">
              Global ID
            </Badge>
            <span className="text-blue-800 font-mono text-xs">{globalId || "Not resolved"}</span>
          </div>
          {searchUrl && (
            <div>
              <Badge variant="outline" className="mr-2">
                Search API
              </Badge>
              <span className="text-blue-800 font-mono text-xs break-all">{searchUrl}</span>
            </div>
          )}
          {departuresUrl && (
            <div>
              <Badge variant="outline" className="mr-2">
                Departures API
              </Badge>
              <span className="text-blue-800 font-mono text-xs break-all">{departuresUrl}</span>
            </div>
          )}
          <div>
            <Badge variant="outline" className="mr-2">
              News API
            </Badge>
            <span className="text-blue-800 font-mono text-xs break-all">{newsUrl}</span>
          </div>
          <div>
            <Badge variant="outline" className="mr-2">
              API Key
            </Badge>
            <span className="text-blue-800">{process.env.NEXT_PUBLIC_API_KEY ? "✅ Configured" : "❌ Not set"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
