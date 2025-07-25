import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get("symbols") || "TSLA,AAPL,MSFT,GOOGL,AMZN"

    const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY

    if (!FINNHUB_API_KEY) {
      throw new Error("Finnhub API key not configured")
    }

    // Get date range (last 7 days)
    const today = new Date()
    const fromDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const fromDateStr = fromDate.toISOString().split("T")[0]
    const toDateStr = today.toISOString().split("T")[0]

    const symbolList = symbols.split(",").map((s) => s.trim().toUpperCase())
    const allNews: any[] = []

    // Fetch news for each symbol
    for (const symbol of symbolList.slice(0, 5)) {
      // Limit to 5 symbols to avoid rate limits
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDateStr}&to=${toDateStr}&token=${FINNHUB_API_KEY}`,
          {
            next: { revalidate: 300 }, // Cache for 5 minutes
          },
        )

        if (response.ok) {
          const symbolNews = await response.json()
          const transformedNews = symbolNews.slice(0, 10).map((item: any, index: number) => ({
            id: `${symbol}-${item.datetime}-${index}`,
            title: item.headline,
            summary: item.summary || item.headline.substring(0, 200) + "...",
            url: item.url,
            time_published: new Date(item.datetime * 1000).toISOString().replace(/[-:]/g, "").split(".")[0],
            ticker_sentiment: [
              {
                ticker: symbol,
                relevance_score: "0.9",
                ticker_sentiment_score: "0.5",
              },
            ],
            source: item.source,
            image: item.image,
            category: item.category,
          }))
          allNews.push(...transformedNews)
        }
      } catch (error) {
        console.error(`Error fetching news for ${symbol}:`, error)
      }
    }

    // Sort by datetime (most recent first)
    allNews.sort((a, b) => new Date(b.time_published).getTime() - new Date(a.time_published).getTime())

    return NextResponse.json({
      feed: allNews.slice(0, 50), // Return top 50 most recent
      symbols: symbolList,
    })
  } catch (error) {
    console.error("Stock news API error:", error)

    return NextResponse.json({
      feed: [
        {
          id: "error-1",
          title: "Unable to fetch stock-specific news",
          summary: "Please check your Finnhub API key configuration.",
          url: "https://finnhub.io",
          time_published: new Date().toISOString().replace(/[-:]/g, "").split(".")[0],
          ticker_sentiment: [{ ticker: "ERROR", relevance_score: "1.0", ticker_sentiment_score: "0.0" }],
        },
      ],
    })
  }
}
