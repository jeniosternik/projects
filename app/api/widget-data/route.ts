import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Fetch latest news for widget
    const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "demo"

    const response = await fetch(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=TSLA,AAPL,MSFT,GOOGL,AMZN&apikey=${API_KEY}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      },
    )

    let widgetData = {
      title: "Trading Alerts",
      subtitle: "Latest Market News",
      items: [
        {
          title: "No news available",
          subtitle: "Check back later",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    }

    if (response.ok) {
      const data = await response.json()
      const latestNews = data.feed?.slice(0, 3) || []

      if (latestNews.length > 0) {
        widgetData = {
          title: "Trading Alerts",
          subtitle: `${latestNews.length} new updates`,
          items: latestNews.map((item: any) => ({
            title: item.title.substring(0, 50) + (item.title.length > 50 ? "..." : ""),
            subtitle: item.ticker_sentiment?.[0]?.ticker || "Market",
            time: new Date(
              item.time_published.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, "$1-$2-$3T$4:$5:$6"),
            ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          })),
        }
      }
    }

    return NextResponse.json(widgetData)
  } catch (error) {
    console.error("Widget data error:", error)

    // Return fallback data
    return NextResponse.json({
      title: "Trading Alerts",
      subtitle: "Market Updates",
      items: [
        {
          title: "Markets are active",
          subtitle: "TSLA",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    })
  }
}
