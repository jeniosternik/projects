"use client"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  AlertCircle,
  Check,
  ExternalLink,
  TrendingUp,
  ArrowUpDown,
  Filter,
  X,
  Zap,
  Sparkles,
  CheckCheck,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { subscribeUser } from "./actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

// Default VAPID public key for demo (generate your own for production)
const DEFAULT_VAPID_KEY = "BEl62iUYgUivxIkv69yViEuiBIa40HI6YUTpZrToZNNjr6j-Nklcw-M_-cXBkQv3bhfz_Uu-Qs1hEtp09jVNsjM"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Create a more robust global identifier for news items
function createGlobalId(item: any): string {
  // Normalize title more aggressively
  const normalizedTitle = item.title
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // Replace all non-alphanumeric with spaces
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim()
    .substring(0, 80) // Shorter substring for better matching

  // Use URL as primary identifier if available, fallback to title
  if (item.url) {
    try {
      const url = new URL(item.url)
      return `url-${url.hostname}-${url.pathname.replace(/[^\w]/g, "")}`
    } catch {
      // If URL parsing fails, fall back to title-based ID
    }
  }

  // Fallback to title + rough time
  const timeKey = item.time_published.substring(0, 10) // YYYYMMDDHH for better grouping
  return `title-${normalizedTitle.replace(/\s+/g, "-")}-${timeKey}`
}

interface NewsItem {
  id: string
  globalId: string
  title: string
  summary: string
  url: string
  time_published: string
  ticker_sentiment?: Array<{
    ticker: string
    relevance_score: string
    ticker_sentiment_score: string
  }>
  isRead?: boolean
  source?: string
  image?: string
  provider?: string
  industry_related?: boolean
  isNew?: boolean
}

type SortOption = "newest" | "oldest"

function NewsCard({ news, onMarkAsRead }: { news: NewsItem; onMarkAsRead: (id: string) => void }) {
  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, "$1-$2-$3T$4:$5:$6"))
      const now = new Date()
      const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)

      if (diffInMinutes < 1) {
        return "Just now"
      } else if (diffInMinutes < 60) {
        return `${Math.floor(diffInMinutes)}m ago`
      } else if (diffInMinutes < 1440) {
        return `${Math.floor(diffInMinutes / 60)}h ago`
      } else {
        return date.toLocaleDateString([], { month: "short", day: "numeric" })
      }
    } catch {
      return "Recent"
    }
  }

  const getRelevantTickers = () => {
    return news.ticker_sentiment?.slice(0, 3) || []
  }

  const handleReadArticle = () => {
    window.open(news.url, "_blank")
    onMarkAsRead(news.id)
  }

  const isVeryRecent = () => {
    try {
      const date = new Date(
        news.time_published.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, "$1-$2-$3T$4:$5:$6"),
      )
      const now = new Date()
      const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)
      return diffInMinutes < 30
    } catch {
      return false
    }
  }

  return (
    <Card
      className={`mb-3 transition-all duration-500 ${
        isVeryRecent() ? "ring-2 ring-green-200 bg-green-50/30" : ""
      } ${news.isNew ? "ring-2 ring-blue-200 bg-blue-50/30 animate-pulse" : ""}`}
    >
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {isVeryRecent() && <Zap className="h-3 w-3 text-green-600" />}
                {news.isNew && <Sparkles className="h-3 w-3 text-blue-600" />}
                <h3 className="font-semibold text-sm leading-tight">{news.title}</h3>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Clock className="h-3 w-3" />
              {formatTime(news.time_published)}
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{news.summary}</p>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {getRelevantTickers().length > 0 ? (
                <>
                  {getRelevantTickers().map((sentiment) => (
                    <Badge key={sentiment.ticker} variant="outline" className="text-xs">
                      {sentiment.ticker}
                    </Badge>
                  ))}
                  {news.industry_related && (
                    <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                      Industry
                    </Badge>
                  )}
                </>
              ) : (
                news.source && (
                  <Badge variant="secondary" className="text-xs">
                    {news.source}
                  </Badge>
                )
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="link" className="p-0 h-auto text-xs text-blue-600" onClick={handleReadArticle}>
              <ExternalLink className="h-3 w-3 mr-1" />
              Read Article
            </Button>

            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => onMarkAsRead(news.id)}>
              <Check className="h-3 w-3 mr-1" />
              Mark Read
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function NewsFeed() {
  const [allNews, setAllNews] = useState<NewsItem[]>([])
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [readItems, setReadItems] = useState<Set<string>>(new Set())
  const [readItemsLoaded, setReadItemsLoaded] = useState(false) // New state to track if read items are loaded
  const [sortOption, setSortOption] = useState<SortOption>("newest")
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)
  const [newsSources, setNewsSources] = useState<any[]>([])
  const [newItemsCount, setNewItemsCount] = useState(0)

  const getWatchlist = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("trading-watchlist")
      return saved ? JSON.parse(saved) : ["TSLA", "AAPL", "MSFT"]
    }
    return ["TSLA", "AAPL", "MSFT"]
  }

  const getReadItems = (): Set<string> => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("trading-read-items")
      return saved ? new Set(JSON.parse(saved)) : new Set()
    }
    return new Set()
  }

  const saveReadItems = (readItems: Set<string>) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("trading-read-items", JSON.stringify(Array.from(readItems)))
    }
  }

  // Load read items first, then set the flag
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedReadItems = getReadItems()
      setReadItems(savedReadItems)
      setReadItemsLoaded(true) // Mark as loaded
      console.log(`📖 Loaded ${savedReadItems.size} read items from storage`)
    }
  }, [])

  const filterRecentNews = (newsItems: NewsItem[]) => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    return newsItems.filter((item) => {
      try {
        const itemDate = new Date(
          item.time_published.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, "$1-$2-$3T$4:$5:$6"),
        )
        return itemDate >= twentyFourHoursAgo
      } catch {
        return true
      }
    })
  }

  const getWatchlistTickers = (newsItems: NewsItem[]) => {
    const watchlist = getWatchlist()
    const tickersInNews = new Set<string>()

    newsItems.forEach((item) => {
      item.ticker_sentiment?.forEach((sentiment) => {
        if (watchlist.includes(sentiment.ticker)) {
          tickersInNews.add(sentiment.ticker)
        }
      })
    })

    return Array.from(tickersInNews).sort()
  }

  useEffect(() => {
    let filtered = [...allNews]

    if (selectedTicker) {
      filtered = filtered.filter((item) =>
        item.ticker_sentiment?.some((sentiment) => sentiment.ticker === selectedTicker),
      )
    }

    filtered.sort((a, b) => {
      const dateA = new Date(
        a.time_published.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, "$1-$2-$3T$4:$5:$6"),
      ).getTime()
      const dateB = new Date(
        b.time_published.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, "$1-$2-$3T$4:$5:$6"),
      ).getTime()

      return sortOption === "newest" ? dateB - dateA : dateA - dateB
    })

    setFilteredNews(filtered)
  }, [allNews, sortOption, selectedTicker])

  useEffect(() => {
    const initializePushNotifications = async () => {
      const isPreview =
        window.location.hostname.includes("vusercontent.net") || window.location.hostname.includes("preview")

      if (isPreview) return

      if ("serviceWorker" in navigator && "PushManager" in window) {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" })
          await navigator.serviceWorker.ready

          const existingSubscription = await registration.pushManager.getSubscription()

          if (!existingSubscription) {
            const permission = await Notification.requestPermission()

            if (permission === "granted") {
              const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || DEFAULT_VAPID_KEY
              const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

              const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey,
              })

              await subscribeUser(JSON.parse(JSON.stringify(subscription)))
              console.log("Push notifications enabled automatically")
            }
          }
        } catch (error) {
          console.log("Push notifications not available:", error)
        }
      }
    }

    initializePushNotifications()
  }, [])

  // Only start fetching news after read items are loaded
  useEffect(() => {
    if (!readItemsLoaded) return // Don't fetch until read items are loaded

    fetchNews(true) // Initial load
    const interval = setInterval(() => fetchNews(false), 90000) // Refresh every 1.5 minutes
    return () => clearInterval(interval)
  }, [readItemsLoaded]) // Depend on readItemsLoaded

  const fetchNews = useCallback(
    async (isInitialLoad = false) => {
      if (!readItemsLoaded) {
        console.log("⏳ Waiting for read items to load before fetching news...")
        return // Don't fetch if read items aren't loaded yet
      }

      if (isInitialLoad) {
        setIsLoading(true)
      }

      try {
        const headers: { [key: string]: string } = {}

        if (typeof window !== "undefined") {
          const alphaKey = localStorage.getItem("api-key-alphavantage")
          const newsKey = localStorage.getItem("api-key-newsapi")
          const finnhubKey = localStorage.getItem("api-key-finnhub")

          if (alphaKey) headers["x-api-key-alpha_vantage"] = alphaKey
          if (newsKey) headers["x-api-key-newsapi"] = newsKey
          if (finnhubKey) headers["x-api-key-finnhub"] = finnhubKey

          const watchlist = getWatchlist()
          headers["x-watchlist"] = JSON.stringify(watchlist)
        }

        const response = await fetch("/api/news-aggregator", { headers })
        const data = await response.json()

        const recentNews = filterRecentNews(data.feed || [])

        // Add global IDs and filter out read items
        const newsWithGlobalIds = recentNews.map((item: any) => ({
          ...item,
          globalId: createGlobalId(item),
        }))

        // Filter out items that have been marked as read
        const unreadNews = newsWithGlobalIds.filter((item: any) => {
          const isRead = readItems.has(item.globalId)
          if (isRead) {
            console.log(`🚫 Filtering out read item: ${item.title.substring(0, 50)}...`)
          }
          return !isRead
        })

        console.log(
          `📰 Fetched ${recentNews.length} total, ${unreadNews.length} unread (${readItems.size} read items in memory)`,
        )

        if (isInitialLoad) {
          // Initial load: replace all news with unread items only
          setAllNews(unreadNews)
        } else {
          // Incremental update: add only new unread items
          // Use globalId for deduplication to prevent duplicates
          const existingGlobalIds = new Set(allNews.map((item) => item.globalId))
          const newItems = unreadNews.filter((item: any) => !existingGlobalIds.has(item.globalId))

          if (newItems.length > 0) {
            const newsWithNewFlag = newItems.map((item: any) => ({
              ...item,
              isNew: true, // Mark as new for visual indication
            }))

            // Add new items to the top
            setAllNews((prevNews) => [...newsWithNewFlag, ...prevNews])
            setNewItemsCount(newItems.length)

            // Remove "new" indicator after 10 seconds
            setTimeout(() => {
              setAllNews((prevNews) => prevNews.map((item) => ({ ...item, isNew: false })))
              setNewItemsCount(0)
            }, 10000)

            console.log(`📰 Added ${newItems.length} new unread articles`)
          }
        }

        setNewsSources(data.sources || [])
        setLastUpdate(new Date())
      } catch (error) {
        console.error("Failed to fetch news:", error)
      } finally {
        if (isInitialLoad) {
          setIsLoading(false)
        }
      }
    },
    [allNews, readItems, readItemsLoaded], // Add readItemsLoaded as dependency
  )

  const markAsRead = (id: string) => {
    // Find the item to get its globalId
    const item = allNews.find((news) => news.id === id)
    if (!item) return

    const newReadItems = new Set(readItems)
    newReadItems.add(item.globalId)
    setReadItems(newReadItems)

    // Save to localStorage
    saveReadItems(newReadItems)

    // Remove the item from the list immediately
    setAllNews((prevNews) => prevNews.filter((news) => news.id !== id))

    console.log(`📖 Marked as read: ${item.title.substring(0, 50)}... (${newReadItems.size} total read)`)
  }

  const markAllAsRead = () => {
    const newReadItems = new Set(readItems)

    // Add all currently visible items to read list
    filteredNews.forEach((item) => {
      newReadItems.add(item.globalId)
    })

    setReadItems(newReadItems)
    saveReadItems(newReadItems)

    // Remove all currently visible items from the list
    const visibleIds = new Set(filteredNews.map((item) => item.id))
    setAllNews((prevNews) => prevNews.filter((news) => !visibleIds.has(news.id)))

    console.log(`📖 Marked ${filteredNews.length} articles as read (${newReadItems.size} total read)`)
  }

  const unreadCount = filteredNews.length
  const availableTickers = getWatchlistTickers(allNews)
  const activeSources = newsSources.filter((s) => s.status === "fulfilled").length

  // Format time in 24-hour format
  const formatLastUpdate = (date: Date | null) => {
    if (!date) return "Never"
    return date.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">📈 Trading News</h1>
              <p className="text-xs text-gray-600">
                {unreadCount} unread • {activeSources} sources • Updated: {formatLastUpdate(lastUpdate)}
                {newItemsCount > 0 && <span className="ml-2 text-blue-600 font-medium">+{newItemsCount} new</span>}
              </p>
            </div>
            <Navigation onRefresh={() => fetchNews(false)} isRefreshing={false} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        {/* Controls Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Latest Updates</span>
            <Badge variant="outline" className="text-xs">
              24h • 90s refresh
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            {/* Mark All as Read */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={markAllAsRead}
              disabled={filteredNews.length === 0}
              title="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
            </Button>

            {/* Sort Control */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortOption("newest")}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${sortOption === "newest" ? "bg-blue-600" : "bg-gray-300"}`}
                    />
                    Newest First
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption("oldest")}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${sortOption === "oldest" ? "bg-blue-600" : "bg-gray-300"}`}
                    />
                    Oldest First
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Control */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
                  <Filter className="h-4 w-4" />
                  {selectedTicker && <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Filter by Watchlist</div>
                <DropdownMenuSeparator />

                {selectedTicker && (
                  <>
                    <DropdownMenuItem onClick={() => setSelectedTicker(null)}>
                      <div className="flex items-center gap-2">
                        <X className="h-3 w-3" />
                        Clear Filter
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem onClick={() => setSelectedTicker(null)}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${!selectedTicker ? "bg-blue-600" : "bg-gray-300"}`} />
                    All Watchlist
                  </div>
                </DropdownMenuItem>

                {availableTickers.map((ticker) => (
                  <DropdownMenuItem key={ticker} onClick={() => setSelectedTicker(ticker)}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${selectedTicker === ticker ? "bg-blue-600" : "bg-gray-300"}`}
                      />
                      {ticker}
                    </div>
                  </DropdownMenuItem>
                ))}

                {availableTickers.length === 0 && (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">No watchlist tickers in recent news</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Active Filters Display */}
        {selectedTicker && (
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="text-xs">
              Filtered by: {selectedTicker}
              <button
                onClick={() => setSelectedTicker(null)}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
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
        ) : filteredNews.length > 0 ? (
          <div className="space-y-3">
            {filteredNews.map((item) => (
              <NewsCard key={item.id} news={item} onMarkAsRead={markAsRead} />
            ))}
          </div>
        ) : selectedTicker ? (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No News for {selectedTicker}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No recent news found for this ticker in the last 24 hours
            </p>
            <Button onClick={() => setSelectedTicker(null)} variant="outline" size="sm">
              Clear Filter
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent News</h3>
            <p className="text-sm text-muted-foreground mb-4">No news available from the last 24 hours</p>
            <Button onClick={() => fetchNews(true)} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function HomePage() {
  return <NewsFeed />
}
