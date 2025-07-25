import { NextResponse } from "next/server"
import { buildIndustryMap, getIndustrySearchTerms, isRelevantToWatchlist } from "@/lib/industry-utils"

interface NewsSource {
  name: string
  fetch: (apiKey?: string, watchlist?: string[], industryMap?: any) => Promise<any[]>
}

// Alpha Vantage News with better relevance
async function fetchAlphaVantageNews(apiKey?: string, watchlist?: string[], industryMap?: any) {
  try {
    const API_KEY = apiKey || process.env.ALPHA_VANTAGE_API_KEY || "demo"

    // Build comprehensive ticker list
    let allTickers = [...(watchlist || ["TSLA", "AAPL", "MSFT"])]

    if (watchlist && industryMap) {
      watchlist.forEach((ticker) => {
        const industryInfo = industryMap[ticker]
        if (industryInfo) {
          allTickers.push(...industryInfo.competitors.slice(0, 3))
        }
      })
    }

    allTickers = [...new Set(allTickers)].slice(0, 20)

    const response = await fetch(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${allTickers.join(",")}&limit=100&apikey=${API_KEY}`,
      {
        next: { revalidate: 30 }, // Reduced cache time for fresher data
      },
    )

    if (!response.ok) throw new Error(`Alpha Vantage error: ${response.status}`)

    const data = await response.json()

    if (data["Error Message"] || data["Note"]) {
      throw new Error(data["Error Message"] || data["Note"])
    }

    const allNews = (data.feed || []).map((item: any, index: number) => {
      const isIndustryRelated =
        watchlist &&
        industryMap &&
        item.ticker_sentiment?.some((ts: any) => !watchlist.includes(ts.ticker) && allTickers.includes(ts.ticker))

      return {
        id: `av-${item.time_published}-${index}`,
        title: item.title,
        summary: item.summary || item.title.substring(0, 200) + "...",
        url: item.url,
        time_published: item.time_published,
        ticker_sentiment: item.ticker_sentiment || [],
        source: item.source,
        image: item.banner_image,
        provider: "Alpha Vantage",
        industry_related: isIndustryRelated,
      }
    })

    // Filter for relevance
    return watchlist ? allNews.filter((item) => isRelevantToWatchlist(item, watchlist, industryMap || {})) : allNews
  } catch (error) {
    console.error("Alpha Vantage news error:", error)
    return []
  }
}

// NewsAPI with better relevance
async function fetchNewsAPI(apiKey?: string, watchlist?: string[], industryMap?: any) {
  try {
    const API_KEY = apiKey || process.env.NEWSAPI_KEY

    if (!API_KEY) return []

    // Build more targeted search query
    const searchTerms = [...(watchlist || ["Tesla", "Apple", "Microsoft"])]

    if (watchlist && industryMap) {
      const industryTerms = getIndustrySearchTerms(industryMap)
      searchTerms.push(...industryTerms.slice(0, 15))
    }

    const query = searchTerms.join(" OR ")
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&domains=reuters.com,bloomberg.com,cnbc.com,marketwatch.com,yahoo.com,techcrunch.com,seekingalpha.com&sortBy=publishedAt&pageSize=50&apiKey=${API_KEY}`,
      {
        next: { revalidate: 30 }, // Reduced cache time
      },
    )

    if (!response.ok) throw new Error(`NewsAPI error: ${response.status}`)

    const data = await response.json()

    if (data.code || data.status !== "ok") {
      throw new Error(data.message || "NewsAPI error")
    }

    const allNews = (data.articles || []).map((item: any, index: number) => {
      // Enhanced ticker detection
      const text = `${item.title} ${item.description || ""}`.toUpperCase()
      const allPossibleTickers = [
        ...(watchlist || []),
        ...Object.keys(industryMap || {}),
        ...Object.values(industryMap || {}).flatMap((info: any) => info.competitors || []),
      ]

      const tickers = [...new Set(allPossibleTickers)]
        .filter((ticker) => {
          const companyNames: { [key: string]: string[] } = {
            TSLA: ["TESLA", "ELON MUSK"],
            AAPL: ["APPLE", "IPHONE", "IPAD", "MAC"],
            MSFT: ["MICROSOFT", "AZURE", "WINDOWS"],
            GOOGL: ["GOOGLE", "ALPHABET", "YOUTUBE"],
            AMZN: ["AMAZON", "AWS"],
            NVDA: ["NVIDIA"],
            META: ["META", "FACEBOOK", "INSTAGRAM"],
          }

          return (
            text.includes(ticker) || (companyNames[ticker] && companyNames[ticker].some((name) => text.includes(name)))
          )
        })
        .map((ticker) => ({
          ticker,
          relevance_score: "0.8",
          ticker_sentiment_score: "0.5",
        }))

      const isIndustryRelated =
        watchlist &&
        tickers.some(
          (t) =>
            !watchlist.includes(t.ticker) &&
            Object.values(industryMap || {}).some((info: any) => info.competitors?.includes(t.ticker)),
        )

      return {
        id: `newsapi-${item.publishedAt}-${index}`,
        title: item.title,
        summary: item.description || item.title,
        url: item.url,
        time_published: new Date(item.publishedAt).toISOString().replace(/[-:]/g, "").split(".")[0],
        ticker_sentiment: tickers,
        source: item.source?.name || "NewsAPI",
        image: item.urlToImage,
        provider: "NewsAPI",
        industry_related: isIndustryRelated,
      }
    })

    // Filter for relevance
    return watchlist ? allNews.filter((item) => isRelevantToWatchlist(item, watchlist, industryMap || {})) : allNews
  } catch (error) {
    console.error("NewsAPI error:", error)
    return []
  }
}

// Enhanced Finnhub with better relevance
async function fetchFinnhubNews(apiKey?: string, watchlist?: string[], industryMap?: any) {
  try {
    const FINNHUB_API_KEY = apiKey || process.env.FINNHUB_API_KEY
    if (!FINNHUB_API_KEY) return []

    const allNews: any[] = []

    // Build comprehensive symbol list
    let symbols = [...(watchlist || ["TSLA", "AAPL", "MSFT"])]

    if (watchlist && industryMap) {
      watchlist.forEach((ticker) => {
        const industryInfo = industryMap[ticker]
        if (industryInfo) {
          symbols.push(...industryInfo.competitors.slice(0, 3))
        }
      })
    }

    symbols = [...new Set(symbols)].slice(0, 15)

    const today = new Date()
    const yesterday = new Date(today.getTime() - 12 * 60 * 60 * 1000) // Last 12 hours for fresher data
    const fromDate = yesterday.toISOString().split("T")[0]
    const toDate = today.toISOString().split("T")[0]

    // Fetch company-specific news
    for (const symbol of symbols) {
      try {
        const companyResponse = await fetch(
          `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${FINNHUB_API_KEY}`,
          { next: { revalidate: 30 } },
        )

        if (companyResponse.ok) {
          const companyData = await companyResponse.json()
          const isIndustryRelated = watchlist && !watchlist.includes(symbol)

          const transformedCompany = companyData.slice(0, 10).map((item: any, index: number) => ({
            id: `finnhub-${symbol}-${item.datetime}-${index}`,
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
            provider: "Finnhub",
            industry_related: isIndustryRelated,
          }))
          allNews.push(...transformedCompany)
        }
      } catch (error) {
        console.log(`Finnhub ${symbol} news error:`, error)
      }
    }

    return allNews
  } catch (error) {
    console.error("Finnhub news error:", error)
    return []
  }
}

export async function GET(request: Request) {
  try {
    console.log("🔄 Fetching fresh news from multiple sources...")

    const alphaVantageKey = request.headers.get("x-api-key-alpha_vantage") || process.env.ALPHA_VANTAGE_API_KEY
    const newsApiKey = request.headers.get("x-api-key-newsapi") || process.env.NEWSAPI_KEY
    const finnhubKey = request.headers.get("x-api-key-finnhub") || process.env.FINNHUB_API_KEY

    const watchlistHeader = request.headers.get("x-watchlist")
    const watchlist = watchlistHeader ? JSON.parse(watchlistHeader) : null

    console.log("📋 Watchlist:", watchlist)

    // Build dynamic industry map using shared utility
    const industryMap = watchlist ? await buildIndustryMap(watchlist, finnhubKey) : {}
    console.log("🏭 Industry map:", Object.keys(industryMap))

    const sources: NewsSource[] = [
      { name: "Alpha Vantage", fetch: (key, wl, im) => fetchAlphaVantageNews(key || undefined, wl, im) },
      { name: "NewsAPI", fetch: (key, wl, im) => fetchNewsAPI(key || undefined, wl, im) },
      { name: "Finnhub", fetch: (key, wl, im) => fetchFinnhubNews(key || undefined, wl, im) },
    ]

    const results = await Promise.allSettled(
      sources.map(async (source) => {
        const startTime = Date.now()
        const news = await source.fetch(
          source.name === "Alpha Vantage" ? alphaVantageKey : source.name === "NewsAPI" ? newsApiKey : finnhubKey,
          watchlist,
          industryMap,
        )
        const duration = Date.now() - startTime
        console.log(`📰 ${source.name}: ${news.length} relevant articles (${duration}ms)`)
        return news
      }),
    )

    const allNews: any[] = []
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        allNews.push(...result.value)
      } else {
        console.error(`❌ ${sources[index].name} failed:`, result.reason)
      }
    })

    // Enhanced deduplication
    const uniqueNews = []
    const seenTitles = new Set()

    for (const item of allNews) {
      const normalizedTitle = item.title
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .substring(0, 60)
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle)
        uniqueNews.push(item)
      }
    }

    // Sort by publication time (most recent first)
    uniqueNews.sort((a, b) => {
      const timeA = new Date(
        a.time_published.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, "$1-$2-$3T$4:$5:$6"),
      ).getTime()
      const timeB = new Date(
        b.time_published.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, "$1-$2-$3T$4:$5:$6"),
      ).getTime()
      return timeB - timeA
    })

    const industryCount = uniqueNews.filter((item) => item.industry_related).length

    console.log(
      `✅ ${uniqueNews.length} relevant articles (${industryCount} industry-related) from ${results.filter((r) => r.status === "fulfilled").length} sources`,
    )

    return NextResponse.json({
      feed: uniqueNews.slice(0, 80),
      sources: sources.map((s, i) => ({
        name: s.name,
        status: results[i].status,
        count: results[i].status === "fulfilled" ? results[i].value.length : 0,
      })),
      timestamp: new Date().toISOString(),
      total: uniqueNews.length,
      industryRelated: industryCount,
      watchlist: watchlist,
      industryMap: Object.keys(industryMap),
    })
  } catch (error) {
    console.error("News aggregator error:", error)

    return NextResponse.json({
      feed: [],
      sources: [],
      error: "Aggregation failed",
    })
  }
}
