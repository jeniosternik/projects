// This script generates VAPID keys for web push notifications
// Run with: node scripts/generate-vapid-keys.js

// Import the web-push library
import webpush from "web-push"

try {
  // Generate VAPID keys
  const vapidKeys = webpush.generateVAPIDKeys()

  console.log("VAPID Keys Generated Successfully:")
  console.log("Public Key:", vapidKeys.publicKey)
  console.log("Private Key:", vapidKeys.privateKey)
  console.log("\nAdd these to your environment variables:")
  console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`)
  console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`)
} catch (error) {
  console.error("Error generating VAPID keys:", error)
  process.exit(1)
}
