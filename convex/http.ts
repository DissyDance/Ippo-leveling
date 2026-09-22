/**
 * Routes HTTP Convex. Convex Auth branche ici ses endpoints OAuth
 * (callback Google, etc.).
 */
import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { internal } from './_generated/api'
import { auth } from './auth'

declare const process: { env: Record<string, string | undefined> }

const http = httpRouter()

auth.addHttpRoutes(http)

/** Comparaison à temps constant (évite un oracle temporel sur le secret). */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/**
 * Lecture serveur-à-serveur pour Leveling Master 2.
 * POST /master/player-data
 * Header : x-app-secret = IPPO_APP_SECRET
 * Body   : { email: string }
 * Renvoie : { items: [...], running: {...} } ou 404 si compte introuvable.
 */
http.route({
  path: '/master/player-data',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const expected = process.env.IPPO_APP_SECRET
    if (!expected) return new Response('Pont désactivé', { status: 503 })
    const provided = request.headers.get('x-app-secret') ?? ''
    if (!timingSafeEqual(provided, expected)) {
      return new Response('Forbidden', { status: 403 })
    }

    let body: { email?: string }
    try {
      body = (await request.json()) as { email?: string }
    } catch {
      return new Response('Malformed JSON', { status: 400 })
    }
    if (!body.email || typeof body.email !== 'string') {
      return new Response('Missing email', { status: 400 })
    }

    const data = await ctx.runQuery(internal.master.playerDataByEmail, { email: body.email })
    if (!data) return new Response('Utilisateur Ippo introuvable', { status: 404 })
    return Response.json(data, { status: 200 })
  }),
})

export default http
