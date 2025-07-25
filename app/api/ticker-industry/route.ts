import { NextResponse } from "next/server"
import { detectIndustryForTicker } from "@/lib/industry-utils"

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
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ticker = searchParams.get("ticker")

    if (!ticker) {
      return NextResponse.json({ error: "Ticker parameter required" }, { status: 400 })
    }

    const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY
    const industryInfo = await detectIndustryForTicker(ticker.toUpperCase(), FINNHUB_API_KEY)

    if (!industryInfo) {
      return NextResponse.json({ error: "Could not determine industry" }, { status: 404 })
    }

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      ...industryInfo,
    })
  } catch (error) {
    console.error("Industry detection error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
