/**
 * Running — journal de courses (module autonome, sans XP ni caractéristiques).
 *
 * `record` insère une course, `update` la corrige, `remove` la supprime : CRUD
 * complet, à la différence du ledger append-only `sessions`. La vitesse moyenne
 * et les records personnels ne sont JAMAIS stockés — ils se dérivent de la liste
 * côté client (src/utils/running.utils.ts), source unique de calcul.
 */
import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import { mutation, query } from './_generated/server'

/** Garde-fou commun : distance et temps strictement positifs. */
function assertPositive(distanceMeters: number, durationSeconds: number): void {
  if (!(distanceMeters > 0)) throw new Error('La distance doit être supérieure à 0.')
  if (!(durationSeconds > 0)) throw new Error('Le temps doit être supérieur à 0.')
}

export const list = query({
  args: {},
  handler: async (ctx): Promise<Doc<'runs'>[]> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []
    return await ctx.db
      .query('runs')
      .withIndex('by_user_date', (q) => q.eq('userId', userId))
      .order('desc')
      .collect()
  },
})

export const get = query({
  args: { runId: v.id('runs') },
  handler: async (ctx, args): Promise<Doc<'runs'> | null> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null
    const run = await ctx.db.get(args.runId)
    if (!run || run.userId !== userId) return null
    return run
  },
})

export const record = mutation({
  args: {
    performedAt: v.number(),
    distanceMeters: v.number(),
    durationSeconds: v.number(),
  },
  handler: async (ctx, args): Promise<Id<'runs'>> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Non authentifié')
    assertPositive(args.distanceMeters, args.durationSeconds)
    return await ctx.db.insert('runs', {
      userId,
      performedAt: args.performedAt,
      distanceMeters: args.distanceMeters,
      durationSeconds: args.durationSeconds,
      createdAt: Date.now(),
    })
  },
})

export const update = mutation({
  args: {
    runId: v.id('runs'),
    performedAt: v.number(),
    distanceMeters: v.number(),
    durationSeconds: v.number(),
  },
  handler: async (ctx, args): Promise<void> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Non authentifié')
    const run = await ctx.db.get(args.runId)
    if (!run || run.userId !== userId) throw new Error('Course introuvable')
    assertPositive(args.distanceMeters, args.durationSeconds)
    await ctx.db.patch(args.runId, {
      performedAt: args.performedAt,
      distanceMeters: args.distanceMeters,
      durationSeconds: args.durationSeconds,
    })
  },
})

export const remove = mutation({
  args: { runId: v.id('runs') },
  handler: async (ctx, args): Promise<void> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Non authentifié')
    const run = await ctx.db.get(args.runId)
    if (!run || run.userId !== userId) throw new Error('Course introuvable')
    await ctx.db.delete(args.runId)
  },
})
