"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw, Settings, Calendar, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavigationProps {
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function Navigation({ onRefresh, isRefreshing = false }: NavigationProps) {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-1">
      {/* Home/News Feed */}
      <Link href="/">
        <Button variant={pathname === "/" ? "default" : "ghost"} size="sm">
          <Home className="h-4 w-4" />
        </Button>
      </Link>

      {/* Economic Calendar */}
      <Link href="/calendar">
        <Button variant={pathname === "/calendar" ? "default" : "ghost"} size="sm">
          <Calendar className="h-4 w-4" />
        </Button>
      </Link>

      {/* Watchlist Configuration */}
      <Link href="/watchlist">
        <Button variant={pathname === "/watchlist" ? "default" : "ghost"} size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </Link>

      {/* Refresh Button (only show on news feed) */}
      {pathname === "/" && onRefresh && (
        <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      )}
    </div>
  )
}
