"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, AlertCircle, TrendingUp, Minus, Building2, DollarSign } from "lucide-react"
import { Navigation } from "@/components/navigation"

interface EconomicEvent {
  id: string
  date: string
  time: string
  event: string
  importance: "high" | "medium" | "low"
  previous?: string
  forecast?: string
  actual?: string
  currency: string
  symbol?: string
  type?: "economic" | "earnings"
}

function ImportanceIcon({ importance }: { importance: "high" | "medium" | "low" }) {
  switch (importance) {
    case "high":
      return <TrendingUp className="h-3 w-3 text-red-600" />
    case "medium":
      return <TrendingUp className="h-3 w-3 text-orange-500" />
    case "low":
      return <Minus className="h-3 w-3 text-gray-500" />
  }
}

function ImportanceBadge({ importance }: { importance: "high" | "medium" | "low" }) {
  const colors = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-orange-100 text-orange-800 border-orange-200",
    low: "bg-gray-100 text-gray-600 border-gray-200",
  }

  return (
    <Badge variant="outline" className={`text-xs ${colors[importance]}`}>
      <ImportanceIcon importance={importance} />
      <span className="ml-1 capitalize">{importance}</span>
    </Badge>
  )
}

function EventTypeIcon({ type }: { type?: "economic" | "earnings" }) {
  if (type === "earnings") {
    return <Building2 className="h-3 w-3 text-blue-600" />
  }
  return <DollarSign className="h-3 w-3 text-green-600" />
}

function EventCard({ event }: { event: EconomicEvent }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
    }
  }

  return (
    <Card className="mb-3">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <EventTypeIcon type={event.type} />
                <h3 className="font-semibold text-sm leading-tight">{event.event}</h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(event.date)}</span>
                <Clock className="h-3 w-3 ml-2" />
                <span>{event.time}</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {event.currency}
                </Badge>
                {event.type === "earnings" && event.symbol && (
                  <Badge variant="secondary" className="text-xs">
                    {event.symbol}
                  </Badge>
                )}
              </div>
            </div>
            <ImportanceBadge importance={event.importance} />
          </div>

          {(event.previous || event.forecast || event.actual) && (
            <div className="grid grid-cols-3 gap-2 text-xs">
              {event.previous && (
                <div className="text-center">
                  <div className="text-muted-foreground">Previous</div>
                  <div className="font-medium">{event.previous}</div>
                </div>
              )}
              {event.forecast && (
                <div className="text-center">
                  <div className="text-muted-foreground">{event.type === "earnings" ? "Estimate" : "Forecast"}</div>
                  <div className="font-medium">{event.forecast}</div>
                </div>
              )}
              {event.actual && (
                <div className="text-center">
                  <div className="text-muted-foreground">Actual</div>
                  <div className="font-medium text-blue-600">{event.actual}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function EconomicCalendar() {
  const [events, setEvents] = useState<EconomicEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [dataSource, setDataSource] = useState<string>("")
  const [earningsCount, setEarningsCount] = useState(0)

  useEffect(() => {
    fetchEconomicEvents()
    const interval = setInterval(fetchEconomicEvents, 3600000) // Refresh every hour
    return () => clearInterval(interval)
  }, [])

  const fetchEconomicEvents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/economic-calendar")
      const data = await response.json()
      setEvents(data.events || [])
      setDataSource(data.source || "unknown")
      setEarningsCount(data.earningsCount || 0)
      setLastUpdate(new Date())
    } catch (error) {
      console.error("Failed to fetch economic events:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const groupEventsByDate = (events: EconomicEvent[]) => {
    const grouped: { [key: string]: EconomicEvent[] } = {}
    events.forEach((event) => {
      const date = event.date
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(event)
    })
    return grouped
  }

  const groupedEvents = groupEventsByDate(events)
  const highImportanceCount = events.filter((e) => e.importance === "high").length

  const getDataSourceText = () => {
    switch (dataSource) {
      case "mixed":
        return `${earningsCount} earnings + economic data`
      case "mock":
        return "Sample economic data"
      case "fallback":
        return "Limited API access - sample data"
      default:
        return "Economic calendar data"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">📊 Economic Calendar</h1>
              <p className="text-xs text-gray-600">
                {highImportanceCount} high impact • {getDataSourceText()}
              </p>
            </div>
            <Navigation />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">Next 7 Days</span>
          {dataSource === "fallback" && (
            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
              Sample Data
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <Card>
                  <CardContent className="pt-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : Object.keys(groupedEvents).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(groupedEvents)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .map(([date, dateEvents]) => (
                <div key={date}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 sticky top-16 bg-gray-50 py-1">
                    {new Date(date).toLocaleDateString([], {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  <div className="space-y-2">
                    {dateEvents
                      .sort((a, b) => {
                        const importanceOrder = { high: 3, medium: 2, low: 1 }
                        return importanceOrder[b.importance] - importanceOrder[a.importance]
                      })
                      .map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Available</h3>
            <p className="text-sm text-muted-foreground mb-4">Economic calendar data is currently unavailable</p>
            {dataSource === "fallback" && (
              <p className="text-xs text-amber-600 mb-4">Your Finnhub plan may not include economic calendar access</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function CalendarPage() {
  return <EconomicCalendar />
}
