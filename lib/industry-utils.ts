// Comprehensive industry mapping with automatic detection
const COMPREHENSIVE_INDUSTRY_MAP: { [key: string]: { industry: string; competitors: string[]; keywords: string[] } } = {
  // Technology
  AAPL: {
    industry: "Consumer Electronics",
    competitors: ["MSFT", "GOOGL", "AMZN", "META", "NVDA"],
    keywords: ["iPhone", "smartphone", "consumer electronics", "App Store", "iOS", "Mac", "iPad", "wearables"],
  },
  MSFT: {
    industry: "Cloud Computing & Software",
    competitors: ["GOOGL", "AMZN", "AAPL", "CRM", "ORCL"],
    keywords: ["cloud computing", "Azure", "Office 365", "enterprise software", "AI", "Windows"],
  },
  GOOGL: {
    industry: "Internet & Digital Advertising",
    competitors: ["META", "AMZN", "MSFT", "AAPL"],
    keywords: ["search", "advertising", "YouTube", "Android", "cloud computing", "AI"],
  },
  META: {
    industry: "Social Media & VR",
    competitors: ["GOOGL", "SNAP", "TWTR", "PINS"],
    keywords: ["social media", "Facebook", "Instagram", "metaverse", "VR", "advertising"],
  },
  NVDA: {
    industry: "Semiconductors & AI",
    competitors: ["AMD", "INTC", "QCOM", "TSM"],
    keywords: ["GPU", "AI chips", "data center", "gaming", "machine learning", "semiconductors"],
  },
  AMD: {
    industry: "Semiconductors",
    competitors: ["NVDA", "INTC", "QCOM"],
    keywords: ["CPU", "GPU", "processors", "gaming", "data center", "semiconductors"],
  },
  INTC: {
    industry: "Semiconductors",
    competitors: ["AMD", "NVDA", "QCOM"],
    keywords: ["CPU", "processors", "chips", "semiconductors", "data center"],
  },
  QCOM: {
    industry: "Semiconductors",
    competitors: ["NVDA", "AMD", "INTC"],
    keywords: ["mobile chips", "5G", "wireless", "semiconductors", "Snapdragon"],
  },

  // Electric Vehicles & Automotive
  TSLA: {
    industry: "Electric Vehicles & Clean Energy",
    competitors: ["RIVN", "LCID", "NIO", "XPEV", "BYD", "F", "GM"],
    keywords: ["electric vehicle", "EV", "autonomous driving", "battery", "clean energy", "solar"],
  },
  RIVN: {
    industry: "Electric Vehicles",
    competitors: ["TSLA", "LCID", "F", "GM"],
    keywords: ["electric truck", "EV", "electric vehicle", "Amazon", "delivery"],
  },
  LCID: {
    industry: "Electric Vehicles",
    competitors: ["TSLA", "RIVN", "NIO"],
    keywords: ["luxury EV", "electric vehicle", "Lucid Air", "battery technology"],
  },
  NIO: {
    industry: "Electric Vehicles",
    competitors: ["TSLA", "XPEV", "LI"],
    keywords: ["Chinese EV", "electric vehicle", "battery swap", "autonomous driving"],
  },
  XPEV: {
    industry: "Electric Vehicles",
    competitors: ["TSLA", "NIO", "LI"],
    keywords: ["XPeng", "Chinese EV", "electric vehicle", "autonomous driving"],
  },
  F: {
    industry: "Automotive",
    competitors: ["GM", "TSLA", "RIVN"],
    keywords: ["Ford", "F-150", "electric vehicle", "automotive", "trucks"],
  },
  GM: {
    industry: "Automotive",
    competitors: ["F", "TSLA", "RIVN"],
    keywords: ["General Motors", "electric vehicle", "Ultium", "automotive"],
  },

  // E-commerce & Retail
  AMZN: {
    industry: "E-commerce & Cloud Services",
    competitors: ["MSFT", "GOOGL", "WMT", "SHOP"],
    keywords: ["e-commerce", "AWS", "cloud services", "retail", "logistics", "Prime"],
  },
  SHOP: {
    industry: "E-commerce Platform",
    competitors: ["AMZN", "WMT", "EBAY"],
    keywords: ["e-commerce", "online retail", "merchants", "payments"],
  },
  WMT: {
    industry: "Retail",
    competitors: ["AMZN", "TGT", "COST"],
    keywords: ["retail", "grocery", "e-commerce", "Walmart"],
  },
  TGT: {
    industry: "Retail",
    competitors: ["WMT", "AMZN", "COST"],
    keywords: ["Target", "retail", "grocery", "consumer goods"],
  },

  // Financial Services
  JPM: {
    industry: "Banking",
    competitors: ["BAC", "WFC", "C"],
    keywords: ["banking", "financial services", "loans", "credit", "investment banking"],
  },
  BAC: {
    industry: "Banking",
    competitors: ["JPM", "WFC", "C"],
    keywords: ["Bank of America", "banking", "financial services", "loans"],
  },
  WFC: {
    industry: "Banking",
    competitors: ["JPM", "BAC", "C"],
    keywords: ["Wells Fargo", "banking", "financial services", "loans"],
  },
  C: {
    industry: "Banking",
    competitors: ["JPM", "BAC", "WFC"],
    keywords: ["Citigroup", "banking", "financial services", "investment banking"],
  },
  V: {
    industry: "Payment Processing",
    competitors: ["MA", "PYPL", "SQ"],
    keywords: ["payments", "credit cards", "financial technology", "transactions"],
  },
  MA: {
    industry: "Payment Processing",
    competitors: ["V", "PYPL", "SQ"],
    keywords: ["Mastercard", "payments", "credit cards", "financial technology"],
  },
  PYPL: {
    industry: "Digital Payments",
    competitors: ["V", "MA", "SQ"],
    keywords: ["PayPal", "digital payments", "fintech", "online payments"],
  },

  // Healthcare & Biotech
  JNJ: {
    industry: "Healthcare & Pharmaceuticals",
    competitors: ["PFE", "MRK", "ABBV"],
    keywords: ["healthcare", "pharmaceuticals", "medical devices", "drugs"],
  },
  PFE: {
    industry: "Pharmaceuticals",
    competitors: ["JNJ", "MRK", "ABBV"],
    keywords: ["Pfizer", "pharmaceuticals", "vaccines", "drugs", "biotech"],
  },
  MRK: {
    industry: "Pharmaceuticals",
    competitors: ["PFE", "JNJ", "ABBV"],
    keywords: ["Merck", "pharmaceuticals", "drugs", "biotech", "vaccines"],
  },
  MRNA: {
    industry: "Biotechnology",
    competitors: ["BNTX", "PFE", "NVAX"],
    keywords: ["mRNA", "vaccines", "biotechnology", "therapeutics"],
  },

  // Energy
  XOM: {
    industry: "Oil & Gas",
    competitors: ["CVX", "COP", "BP"],
    keywords: ["oil", "gas", "energy", "petroleum", "refining"],
  },
  CVX: {
    industry: "Oil & Gas",
    competitors: ["XOM", "COP", "BP"],
    keywords: ["Chevron", "oil", "gas", "energy", "petroleum"],
  },

  // Streaming & Entertainment
  NFLX: {
    industry: "Streaming & Entertainment",
    competitors: ["DIS", "WBD", "PARA"],
    keywords: ["streaming", "Netflix", "entertainment", "content", "movies", "TV shows"],
  },
  DIS: {
    industry: "Entertainment & Media",
    competitors: ["NFLX", "WBD", "PARA"],
    keywords: ["Disney", "streaming", "entertainment", "theme parks", "movies"],
  },

  // Additional popular tickers
  UBER: {
    industry: "Ride Sharing & Delivery",
    competitors: ["LYFT", "DASH", "ABNB"],
    keywords: ["ride sharing", "delivery", "gig economy", "transportation"],
  },
  LYFT: {
    industry: "Ride Sharing",
    competitors: ["UBER", "DASH"],
    keywords: ["ride sharing", "transportation", "gig economy"],
  },
  ABNB: {
    industry: "Travel & Hospitality",
    competitors: ["BKNG", "EXPE"],
    keywords: ["Airbnb", "travel", "hospitality", "vacation rentals"],
  },
  COIN: {
    industry: "Cryptocurrency",
    competitors: ["HOOD", "SQ"],
    keywords: ["cryptocurrency", "Bitcoin", "crypto exchange", "digital assets"],
  },
  HOOD: {
    industry: "Financial Technology",
    competitors: ["COIN", "SQ", "PYPL"],
    keywords: ["Robinhood", "trading", "fintech", "investing"],
  },
}

// Industry categories for automatic detection
const INDUSTRY_CATEGORIES = {
  Technology: ["software", "cloud", "AI", "tech", "digital", "internet", "platform"],
  "Electric Vehicles": ["electric", "EV", "battery", "autonomous", "vehicle"],
  Semiconductors: ["chip", "semiconductor", "processor", "GPU", "CPU"],
  Healthcare: ["health", "pharma", "medical", "biotech", "drug"],
  Financial: ["bank", "financial", "payment", "credit", "fintech"],
  Energy: ["oil", "gas", "energy", "renewable", "solar"],
  Retail: ["retail", "commerce", "shopping", "store"],
  Entertainment: ["streaming", "media", "entertainment", "content"],
  Automotive: ["automotive", "car", "vehicle", "truck"],
  "Ride Sharing": ["ride", "sharing", "transportation", "mobility"],
  Cryptocurrency: ["crypto", "bitcoin", "blockchain", "digital currency"],
}

// Function to detect industry based on company name/description
export async function detectIndustryForTicker(
  ticker: string,
  finnhubApiKey?: string,
): Promise<{ industry: string; competitors: string[]; keywords: string[] } | null> {
  try {
    // First check if we have it in our comprehensive map
    if (COMPREHENSIVE_INDUSTRY_MAP[ticker]) {
      return COMPREHENSIVE_INDUSTRY_MAP[ticker]
    }

    // Try to get company info from Finnhub if API key is available
    if (finnhubApiKey) {
      try {
        const response = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${finnhubApiKey}`)

        if (response.ok) {
          const data = await response.json()
          const description = `${data.name || ""} ${data.finnhubIndustry || ""} ${data.weburl || ""}`.toLowerCase()

          // Try to match with industry categories
          for (const [industry, keywords] of Object.entries(INDUSTRY_CATEGORIES)) {
            if (keywords.some((keyword) => description.includes(keyword))) {
              // Find similar companies in our database
              const similarCompanies = Object.keys(COMPREHENSIVE_INDUSTRY_MAP)
                .filter((t) => COMPREHENSIVE_INDUSTRY_MAP[t].industry.toLowerCase().includes(industry.toLowerCase()))
                .slice(0, 5)

              return {
                industry: industry,
                competitors: similarCompanies,
                keywords: keywords,
              }
            }
          }
        }
      } catch (error) {
        console.log(`Finnhub lookup failed for ${ticker}:`, error)
      }
    }

    // Fallback: generic tech classification
    return {
      industry: "Technology",
      competitors: ["AAPL", "MSFT", "GOOGL"],
      keywords: ["technology", "innovation", "digital"],
    }
  } catch (error) {
    console.error(`Error detecting industry for ${ticker}:`, error)
    return null
  }
}

// Build comprehensive industry map for watchlist
export async function buildIndustryMap(watchlist: string[], finnhubApiKey?: string): Promise<{ [key: string]: any }> {
  const industryMap: { [key: string]: any } = {}

  for (const ticker of watchlist) {
    const info = await detectIndustryForTicker(ticker, finnhubApiKey)
    if (info) {
      industryMap[ticker] = info
    }
  }

  return industryMap
}

// Get industry-related search terms for a watchlist
export function getIndustrySearchTerms(industryMap: { [key: string]: any }): string[] {
  const allTerms = new Set<string>()

  Object.values(industryMap).forEach((info: any) => {
    // Add competitors
    info.competitors?.forEach((comp: string) => allTerms.add(comp))
    // Add industry keywords
    info.keywords?.forEach((keyword: string) => allTerms.add(keyword))
  })

  return Array.from(allTerms)
}

// Check if news item is relevant to watchlist
export function isRelevantToWatchlist(item: any, watchlist: string[], industryMap: { [key: string]: any }): boolean {
  const title = item.title?.toLowerCase() || ""
  const summary = item.summary?.toLowerCase() || ""
  const text = `${title} ${summary}`

  // Direct ticker mention
  if (
    watchlist.some(
      (ticker) => text.includes(ticker.toLowerCase()) || item.ticker_sentiment?.some((ts: any) => ts.ticker === ticker),
    )
  ) {
    return true
  }

  // Industry/competitor mention
  for (const ticker of watchlist) {
    const industryInfo = industryMap[ticker]
    if (industryInfo) {
      // Check competitors
      if (
        industryInfo.competitors?.some(
          (comp: string) =>
            text.includes(comp.toLowerCase()) || item.ticker_sentiment?.some((ts: any) => ts.ticker === comp),
        )
      ) {
        return true
      }

      // Check industry keywords (at least 2 keywords for relevance)
      const keywordMatches =
        industryInfo.keywords?.filter((keyword: string) => text.includes(keyword.toLowerCase())).length || 0

      if (keywordMatches >= 2) {
        return true
      }
    }
  }

  return false
}
