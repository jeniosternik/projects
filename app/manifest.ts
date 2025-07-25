import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Trading Alerts - Real-time Stock Notifications",
    short_name: "Trading Alerts",
    description: "Get real-time push notifications for your favorite stocks and trading opportunities",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1f2937",
    orientation: "portrait",
    categories: ["finance", "business", "productivity"],
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/widget-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/screenshot-mobile.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
      },
    ],
    widgets: [
      {
        name: "Trading News",
        description: "Latest stock news and alerts",
        tag: "trading-news",
        ms_ac_template: "adaptive",
        data: "/api/widget-data",
        screenshots: [
          {
            src: "/widget-screenshot.png",
            sizes: "348x188",
            label: "Trading News Widget",
          },
        ],
        icons: [
          {
            src: "/widget-icon.png",
            sizes: "180x180",
          },
        ],
      },
    ],
  }
}
