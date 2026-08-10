import { ConvexReactClient } from 'convex/react'

const url = process.env.EXPO_PUBLIC_CONVEX_URL

if (!url) {
  throw new Error(
    'EXPO_PUBLIC_CONVEX_URL manquant. Renseigne-le dans .env.local (dev) et dans les variables Vercel (prod).',
  )
}

export const convex = new ConvexReactClient(url, {
  unsavedChangesWarning: false,
})
