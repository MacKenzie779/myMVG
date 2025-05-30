"use client"

import { API_CONFIG } from "@/lib/config"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function DebugInfo() {
  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Development Info</h3>
        <div className="space-y-2 text-sm">
          <div>
            <Badge variant="outline" className="mr-2">
              Departures API
            </Badge>
            <span className="text-blue-800 font-mono text-xs break-all">{API_CONFIG.DEPARTURES_URL}</span>
          </div>
          <div>
            <Badge variant="outline" className="mr-2">
              News API
            </Badge>
            <span className="text-blue-800 font-mono text-xs break-all">{API_CONFIG.NEWS_URL}</span>
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
