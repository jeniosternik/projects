import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get("provider")
    const key = searchParams.get("key")

    if (!provider || !key) {
      return NextResponse.json({ success: false, error: "Missing provider or key" })
    }

    let testResult = false
    let errorMessage = ""

    switch (provider) {
      case "finnhub":
        try {
          const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${key}`)
          const data = await response.json()
          testResult = response.ok && !data.error && data.c !== undefined
          if (!testResult) errorMessage = data.error || "Invalid response format"
        } catch (error) {
          errorMessage = "Network error or invalid key"
        }
        break

      case "alphavantage":
        try {
          const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${key}`,
          )
          const data = await response.json()
          testResult = response.ok && !data["Error Message"] && !data["Note"] && data["Global Quote"]
          if (!testResult) {
            errorMessage = data["Error Message"] || data["Note"] || "Invalid response format"
          }
        } catch (error) {
          errorMessage = "Network error or invalid key"
        }
        break

      case "newsapi":
        try {
          const response = await fetch(`https://newsapi.org/v2/everything?q=tesla&pageSize=1&apiKey=${key}`)
          const data = await response.json()
          testResult = response.ok && data.status === "ok" && !data.code
          if (!testResult) {
            errorMessage = data.message || data.code || "Invalid response format"
          }
        } catch (error) {
          errorMessage = "Network error or invalid key"
        }
        break

      default:
        return NextResponse.json({ success: false, error: "Unknown provider" })
    }

    return NextResponse.json({
      success: testResult,
      provider,
      error: testResult ? null : errorMessage,
    })
  } catch (error) {
    console.error("API key test error:", error)
    return NextResponse.json({ success: false, error: "Test failed" })
  }
}
