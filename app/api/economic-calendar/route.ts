import { NextResponse } from "next/server"

export async function GET() {
  try {
    const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY

    if (!FINNHUB_API_KEY) {
      throw new Error("Finnhub API key not configured")
    }

    // Try to get earnings calendar instead (this is usually available on free tier)
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    const fromDateStr = today.toISOString().split("T")[0]
    const toDateStr = nextWeek.toISOString().split("T")[0]

    let economicEvents: any[] = []

    try {
      // Try earnings calendar first (usually available on free tier)
      const earningsResponse = await fetch(
        `https://finnhub.io/api/v1/calendar/earnings?from=${fromDateStr}&to=${toDateStr}&token=${FINNHUB_API_KEY}`,
        {
          next: { revalidate: 3600 }, // Cache for 1 hour
        },
      )

      if (earningsResponse.ok) {
        const earningsData = await earningsResponse.json()

        // Transform earnings data to economic events format
        if (earningsData.earningsCalendar && earningsData.earningsCalendar.length > 0) {
          economicEvents = earningsData.earningsCalendar.slice(0, 20).map((item: any, index: number) => ({
            id: `earnings-${item.symbol}-${item.date}-${index}`,
            date: item.date,
            time: item.hour || "Before Market Open",
            event: `${item.symbol} Earnings Report`,
            importance: "high" as const, // Earnings are always high impact for traders
            previous: item.revenueActual ? `$${(item.revenueActual / 1000000).toFixed(0)}M` : undefined,
            forecast: item.revenueEstimate ? `$${(item.revenueEstimate / 1000000).toFixed(0)}M` : undefined,
            actual: undefined,
            currency: "USD",
            symbol: item.symbol,
            type: "earnings",
          }))
        }
      }
    } catch (error) {
      console.log("Earnings calendar not available:", error)
    }

    // If we have some earnings data, supplement with mock economic events
    // This provides a realistic mix of earnings and economic data
    const mockEconomicEvents = [
      {
        id: "econ-1",
        date: new Date().toISOString().split("T")[0],
        time: "08:30 AM",
        event: "Initial Jobless Claims",
        importance: "medium" as const,
        previous: "230K",
        forecast: "225K",
        currency: "USD",
        type: "economic",
      },
      {
        id: "econ-2",
        date: new Date().toISOString().split("T")[0],
        time: "10:00 AM",
        event: "Consumer Price Index (CPI)",
        importance: "high" as const,
        previous: "3.2%",
        forecast: "3.1%",
        currency: "USD",
        type: "economic",
      },
      {
        id: "econ-3",
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
        time: "02:00 PM",
        event: "Federal Reserve Interest Rate Decision",
        importance: "high" as const,
        previous: "5.25%",
        forecast: "5.50%",
        currency: "USD",
        type: "economic",
      },
      {
        id: "econ-4",
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
        time: "08:30 AM",
        event: "Non-Farm Payrolls",
        importance: "high" as const,
        previous: "150K",
        forecast: "180K",
        currency: "USD",
        type: "economic",
      },
      {
        id: "econ-5",
        date: new Date(Date.now() + 172800000).toISOString().split("T")[0], // Day after tomorrow
        time: "09:15 AM",
        event: "Industrial Production",
        importance: "medium" as const,
        previous: "0.2%",
        forecast: "0.3%",
        currency: "USD",
        type: "economic",
      },
      {
        id: "econ-6",
        date: new Date(Date.now() + 259200000).toISOString().split("T")[0], // 3 days from now
        time: "10:00 AM",
        event: "Consumer Confidence Index",
        importance: "medium" as const,
        previous: "102.0",
        forecast: "103.5",
        currency: "USD",
        type: "economic",
      },
      {
        id: "econ-7",
        date: new Date(Date.now() + 345600000).toISOString().split("T")[0], // 4 days from now
        time: "08:30 AM",
        event: "GDP Growth Rate (Quarterly)",
        importance: "high" as const,
        previous: "2.1%",
        forecast: "2.3%",
        currency: "USD",
        type: "economic",
      },
      {
        id: "econ-8",
        date: new Date(Date.now() + 432000000).toISOString().split("T")[0], // 5 days from now
        time: "02:00 PM",
        event: "FOMC Meeting Minutes",
        importance: "high" as const,
        currency: "USD",
        type: "economic",
      },
      {
        id: "econ-9",
        date: new Date(Date.now() + 518400000).toISOString().split("T")[0], // 6 days from now
        time: "08:30 AM",
        event: "Retail Sales",
        importance: "medium" as const,
        previous: "0.4%",
        forecast: "0.2%",
        currency: "USD",
        type: "economic",
      },
      {
        id: "econ-10",
        date: new Date(Date.now() + 604800000).toISOString().split("T")[0], // 7 days from now
        time: "10:00 AM",
        event: "Housing Starts",
        importance: "low" as const,
        previous: "1.35M",
        forecast: "1.40M",
        currency: "USD",
        type: "economic",
      },
    ]

    // Combine earnings and economic events
    const allEvents = [...economicEvents, ...mockEconomicEvents]

    // Sort by date and importance
    allEvents.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      if (dateA !== dateB) return dateA - dateB

      const importanceOrder = { high: 3, medium: 2, low: 1 }
      return importanceOrder[b.importance] - importanceOrder[a.importance]
    })

    return NextResponse.json({
      events: allEvents.slice(0, 30), // Return top 30 events
      source: economicEvents.length > 0 ? "mixed" : "mock",
      earningsCount: economicEvents.length,
    })
  } catch (error) {
    console.error("Economic calendar API error:", error)

    // Return comprehensive fallback data
    const fallbackEvents = [
      {
        id: "fallback-1",
        date: new Date().toISOString().split("T")[0],
        time: "08:30 AM",
        event: "Initial Jobless Claims",
        importance: "medium" as const,
        previous: "230K",
        forecast: "225K",
        currency: "USD",
        type: "economic",
      },
      {
        id: "fallback-2",
        date: new Date().toISOString().split("T")[0],
        time: "Before Market Open",
        event: "TSLA Earnings Report",
        importance: "high" as const,
        previous: "$24.3B",
        forecast: "$25.1B",
        currency: "USD",
        type: "earnings",
      },
      {
        id: "fallback-3",
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        time: "02:00 PM",
        event: "Federal Reserve Interest Rate Decision",
        importance: "high" as const,
        previous: "5.25%",
        forecast: "5.50%",
        currency: "USD",
        type: "economic",
      },
      {
        id: "fallback-4",
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        time: "After Market Close",
        event: "AAPL Earnings Report",
        importance: "high" as const,
        previous: "$89.5B",
        forecast: "$92.1B",
        currency: "USD",
        type: "earnings",
      },
      {
        id: "fallback-5",
        date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
        time: "08:30 AM",
        event: "Non-Farm Payrolls",
        importance: "high" as const,
        previous: "150K",
        forecast: "180K",
        currency: "USD",
        type: "economic",
      },
    ]

    return NextResponse.json({
      events: fallbackEvents,
      source: "fallback",
      error: "API access limited - showing sample data",
    })
  }
}
