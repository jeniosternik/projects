import { NextResponse } from "next/server"

export async function GET() {
  try {
    const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY

    if (!FINNHUB_API_KEY) {
      throw new Error("Finnhub API key not configured")
    }

    // Get current date for news filtering
    const today = new Date()
    const fromDate = new Date(today.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago

    const fromDateStr = fromDate.toISOString().split("T")[0]
    const toDateStr = today.toISOString().split("T")[0]

    // Fetch general market news from Finnhub
    const response = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform Finnhub data to match our interface
    const transformedNews = data.slice(0, 20).map((item: any, index: number) => ({
      id: `${item.datetime}-${index}`,
      title: item.headline,
      summary: item.summary || item.headline,
      url: item.url,
      time_published: new Date(item.datetime * 1000).toISOString().replace(/[-:]/g, "").split(".")[0],
      ticker_sentiment: item.related
        ? item.related
            .split(",")
            .slice(0, 3)
            .map((ticker: string) => ({
              ticker: ticker.trim().toUpperCase(),
              relevance_score: "0.8",
              ticker_sentiment_score: "0.5",
            }))
        : [],
      source: item.source,
      image: item.image,
    }))

    return NextResponse.json({ feed: transformedNews })
  } catch (error) {
    console.error("Finnhub news API error:", error)

    // Return fallback mock data if API fails
    return NextResponse.json({
      feed: [
        {
          id: "fallback-1",
          title: "Unable to fetch live news data",
          summary: "Please check your Finnhub API configuration. Using fallback data.",
          url: "https://finnhub.io",
          time_published: new Date().toISOString().replace(/[-:]/g, "").split(".")[0],
          ticker_sentiment: [{ ticker: "ERROR", relevance_score: "1.0", ticker_sentiment_score: "0.0" }],
          source: "System",
        },
      ],
    })
  }
}
