"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, X, TrendingUp, Info, Smartphone, Key, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"

interface ApiKey {
  name: string
  key: string
  description: string
  signupUrl: string
  isRequired: boolean
}

function TickerManager() {
  const [tickers, setTickers] = useState<string[]>([])
  const [newTicker, setNewTicker] = useState("")

  // Load watchlist from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("trading-watchlist")
      if (saved) {
        setTickers(JSON.parse(saved))
      } else {
        setTickers(["TSLA", "AAPL", "MSFT"]) // Default watchlist
      }
    }
  }, [])

  // Save to localStorage whenever tickers change
  useEffect(() => {
    if (typeof window !== "undefined" && tickers.length > 0) {
      localStorage.setItem("trading-watchlist", JSON.stringify(tickers))
    }
  }, [tickers])

  const addTicker = () => {
    const ticker = newTicker.trim().toUpperCase()
    if (ticker && !tickers.includes(ticker) && ticker.length <= 5) {
      setTickers([...tickers, ticker])
      setNewTicker("")
    }
  }

  const removeTicker = (ticker: string) => {
    const newTickers = tickers.filter((t) => t !== ticker)
    setTickers(newTickers)
    if (typeof window !== "undefined") {
      localStorage.setItem("trading-watchlist", JSON.stringify(newTickers))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTicker()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Stock Watchlist
        </CardTitle>
        <CardDescription>Add stocks to get news and alerts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter ticker (e.g., NVDA)"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            maxLength={5}
          />
          <Button onClick={addTicker} size="sm" disabled={!newTicker.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {tickers.map((ticker) => (
            <Badge key={ticker} variant="secondary" className="flex items-center gap-1 px-3 py-2 text-sm">
              {ticker}
              <button
                onClick={() => removeTicker(ticker)}
                className="ml-1 hover:bg-red-100 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${ticker}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>

        {tickers.length === 0 && <p className="text-sm text-muted-foreground">Add some tickers to get started</p>}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            You'll receive news and alerts for these stocks and their related industries.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function ApiKeysManager() {
  const [apiKeys, setApiKeys] = useState<{ [key: string]: string }>({})
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({})
  const [testResults, setTestResults] = useState<{ [key: string]: "success" | "error" | "testing" | null }>({})

  const keyConfigs: ApiKey[] = [
    {
      name: "FINNHUB_API_KEY",
      key: "finnhub",
      description: "Stock news and company data",
      signupUrl: "https://finnhub.io/register",
      isRequired: true,
    },
    {
      name: "ALPHA_VANTAGE_API_KEY",
      key: "alphavantage",
      description: "Fresh financial news and market data",
      signupUrl: "https://www.alphavantage.co/support/#api-key",
      isRequired: false,
    },
    {
      name: "NEWSAPI_KEY",
      key: "newsapi",
      description: "Breaking news from major outlets",
      signupUrl: "https://newsapi.org/register",
      isRequired: false,
    },
  ]

  // Load API keys from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKeys: { [key: string]: string } = {}
      keyConfigs.forEach((config) => {
        const saved = localStorage.getItem(`api-key-${config.key}`)
        if (saved) {
          savedKeys[config.key] = saved
        }
      })
      setApiKeys(savedKeys)

      // Set the Alpha Vantage key that the user provided
      if (!savedKeys.alphavantage) {
        const alphaKey = "01CHP61TPEFI8T35"
        savedKeys.alphavantage = alphaKey
        localStorage.setItem("api-key-alphavantage", alphaKey)
        setApiKeys(savedKeys)
      }
    }
  }, [])

  const updateApiKey = (keyName: string, value: string) => {
    const newKeys = { ...apiKeys, [keyName]: value }
    setApiKeys(newKeys)

    if (typeof window !== "undefined") {
      if (value.trim()) {
        localStorage.setItem(`api-key-${keyName}`, value.trim())
      } else {
        localStorage.removeItem(`api-key-${keyName}`)
      }
    }
  }

  const toggleShowKey = (keyName: string) => {
    setShowKeys((prev) => ({ ...prev, [keyName]: !prev[keyName] }))
  }

  const testApiKey = async (config: ApiKey) => {
    const key = apiKeys[config.key]
    if (!key) return

    setTestResults((prev) => ({ ...prev, [config.key]: "testing" }))

    try {
      let testUrl = ""

      switch (config.key) {
        case "finnhub":
          testUrl = `/api/test-key?provider=finnhub&key=${encodeURIComponent(key)}`
          break
        case "alphavantage":
          testUrl = `/api/test-key?provider=alphavantage&key=${encodeURIComponent(key)}`
          break
        case "newsapi":
          testUrl = `/api/test-key?provider=newsapi&key=${encodeURIComponent(key)}`
          break
      }

      const response = await fetch(testUrl)
      const result = await response.json()

      setTestResults((prev) => ({
        ...prev,
        [config.key]: result.success ? "success" : "error",
      }))
    } catch (error) {
      setTestResults((prev) => ({ ...prev, [config.key]: "error" }))
    }
  }

  const getKeyStatus = (config: ApiKey) => {
    const key = apiKeys[config.key]
    const testResult = testResults[config.key]

    if (!key) return { status: "missing", color: "text-gray-500", icon: AlertCircle }
    if (testResult === "testing") return { status: "testing", color: "text-blue-500", icon: Info }
    if (testResult === "success") return { status: "valid", color: "text-green-600", icon: CheckCircle }
    if (testResult === "error") return { status: "invalid", color: "text-red-600", icon: AlertCircle }
    return { status: "configured", color: "text-blue-600", icon: Key }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Keys Configuration
        </CardTitle>
        <CardDescription>Configure your news data sources for the freshest updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-sm">
          <Info className="h-4 w-4 inline mr-2" />
          Keys are stored locally on your device. More keys = fresher news!
        </div>

        {keyConfigs.map((config) => {
          const keyStatus = getKeyStatus(config)
          const StatusIcon = keyStatus.icon

          return (
            <div key={config.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{config.name}</h4>
                    {config.isRequired && (
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                        Required
                      </Badge>
                    )}
                    <StatusIcon className={`h-4 w-4 ${keyStatus.color}`} />
                  </div>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs"
                  onClick={() => window.open(config.signupUrl, "_blank")}
                >
                  Get Key
                </Button>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showKeys[config.key] ? "text" : "password"}
                    placeholder={`Enter your ${config.name}`}
                    value={apiKeys[config.key] || ""}
                    onChange={(e) => updateApiKey(config.key, e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey(config.key)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKeys[config.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testApiKey(config)}
                  disabled={!apiKeys[config.key] || testResults[config.key] === "testing"}
                >
                  {testResults[config.key] === "testing" ? "Testing..." : "Test"}
                </Button>
              </div>

              {testResults[config.key] === "success" && (
                <p className="text-xs text-green-600">✓ API key is valid and working</p>
              )}
              {testResults[config.key] === "error" && (
                <p className="text-xs text-red-600">✗ API key test failed - check your key</p>
              )}
            </div>
          )
        })}

        <div className="pt-4 border-t">
          <h5 className="font-medium text-sm mb-2">Quick Setup Guide:</h5>
          <ol className="text-xs text-muted-foreground space-y-1">
            <li>1. Click "Get Key" links above to sign up (all free!)</li>
            <li>2. Copy your API keys and paste them here</li>
            <li>3. Click "Test" to verify each key works</li>
            <li>4. Enjoy fresher, more comprehensive news!</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

function NotificationInfo() {
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Notifications
        </CardTitle>
        <CardDescription>Manage alerts through your device settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start gap-2 text-blue-800">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">Notifications are automatically enabled</p>
              <p>You'll receive alerts for breaking news about your watchlist stocks.</p>
            </div>
          </div>
        </div>

        {isIOS && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">To manage notifications:</p>
            <ol className="text-xs text-gray-600 space-y-1 ml-4">
              <li>1. Go to iPhone Settings</li>
              <li>2. Find "Trading Alerts" in your app list</li>
              <li>3. Tap "Notifications"</li>
              <li>4. Customize your alert preferences</li>
            </ol>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            High-impact economic events and breaking news will trigger immediate alerts.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function WatchlistPage() {
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  useEffect(() => {
    setIsPreviewMode(
      window.location.hostname.includes("vusercontent.net") || window.location.hostname.includes("preview"),
    )
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">⚙️ Configuration</h1>
              <p className="text-xs text-gray-600">Manage your watchlist, API keys, and notifications</p>
            </div>
            <Navigation />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        {isPreviewMode && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-sm">
            <Info className="h-4 w-4 inline mr-2" />
            Preview Mode: Some features may be limited
          </div>
        )}

        <ApiKeysManager />
        <TickerManager />
        <NotificationInfo />
      </div>
    </div>
  )
}
