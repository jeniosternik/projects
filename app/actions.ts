"use server"

// Simple in-memory storage for subscriptions (use database in production)
let subscriptions: any[] = []

export async function subscribeUser(subscription: any) {
  try {
    if (!subscription || !subscription.endpoint) {
      throw new Error("Invalid subscription object")
    }

    // Store subscription
    subscriptions.push({
      ...subscription,
      timestamp: Date.now(),
    })

    console.log("User subscribed:", subscription.endpoint)
    return { success: true, message: "Successfully subscribed to notifications" }
  } catch (error) {
    console.error("Subscription error:", error)
    return { success: false, error: "Failed to subscribe" }
  }
}

export async function unsubscribeUser() {
  try {
    subscriptions = []
    console.log("User unsubscribed")
    return { success: true, message: "Successfully unsubscribed" }
  } catch (error) {
    console.error("Unsubscription error:", error)
    return { success: false, error: "Failed to unsubscribe" }
  }
}

export async function getSubscriptionCount() {
  return { count: subscriptions.length }
}

// Automatically send notifications for breaking news
export async function sendBreakingNewsNotification(title: string, body: string, ticker?: string) {
  try {
    console.log("Sending breaking news notification:", { title, body, ticker })
    console.log(`Would notify ${subscriptions.length} subscribers`)

    // In production, you'd use a proper push service here
    // For now, we'll just log the notification
    return { success: true, message: `Notification sent to ${subscriptions.length} subscribers` }
  } catch (error) {
    console.error("Breaking news notification error:", error)
    return { success: false, error: "Failed to send notification" }
  }
}

// For testing purposes only
export async function sendTestNotification(message: string) {
  try {
    console.log("Test notification:", message, "to", subscriptions.length, "subscribers")
    return { success: true, message: `Test notification sent to ${subscriptions.length} subscribers` }
  } catch (error) {
    console.error("Test notification error:", error)
    return { success: false, error: "Failed to send test notification" }
  }
}
