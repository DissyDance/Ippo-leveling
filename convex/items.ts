/**
 * Items — exercices définis par le joueur (SPEC §5.2, §7.1).
 *
 * Invariants validés CÔTÉ MUTATION (pas seulement au formulaire). `update` ne
 * touche jamais aux sessions : changer le rang n'a aucun effet rétroactif sur
 * l'XP déjà créditée (le ledger fait foi).
 */
import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import type { QueryCtx } from './_generated/server'
import { mutation, query } from './_generated/server'
import { DIRECTION, FIELD_KEY, RANK, STAT } from './validators'
import type { Direction, FieldKey, Stat } from '../src/constants/theme'

/** Valide les invariants du §5.2. Lève une erreur explicite sinon. */
function validateItemShape(
  statTargets: readonly Stat[],
  enabledFields: readonly FieldKey[],
  primaryMetric: FieldKey,
): void {
  if (statTargets.length < 1) {
    throw new Error('Au moins une caractéristique ciblée est requise.')
  }
  if (enabledFields.length < 1) {
    throw new Error('Au moins un champ mesurable doit être activé.')
  }
  if (!enabledFields.includes(primaryMetric)) {
    throw new Error('La métrique principale doit faire partie des champs activés.')
  }
}

type EnrichedItem = { item: Doc<'items'>; record: Doc<'sessions'> | null }

async function withRecord(ctx: QueryCtx, item: Doc<'items'>): Promise<EnrichedItem> {
  const record = item.personalRecordSessionId
    ? await ctx.db.get(item.personalRecordSessionId)
    : null
  return { item, record }
}

export const listActiveItems = query({
  args: {},
  handler: async (ctx): Promise<EnrichedItem[]> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []
    const items = await ctx.db
      .query('items')
      .withIndex('by_user_status', (q) => q.eq('userId', userId).eq('status', 'active'))
      .collect()
    return await Promise.all(items.map((item) => withRecord(ctx, item)))
  },
})

export const getItem = query({
  args: { itemId: v.id('items') },
  handler: async (ctx, args): Promise<EnrichedItem | null> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null
    const item = await ctx.db.get(args.itemId)
    if (!item || item.userId !== userId) return null
    return await withRecord(ctx, item)
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    statTargets: v.array(STAT),
    rank: RANK,
    enabledFields: v.array(FIELD_KEY),
    primaryMetric: FIELD_KEY,
    direction: DIRECTION,
    currentTarget: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Id<'items'>> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Non authentifié')
    validateItemShape(args.statTargets, args.enabledFields, args.primaryMetric)

    return await ctx.db.insert('items', {
      userId,
      name: args.name.trim(),
      description: args.description,
      statTargets: args.statTargets,
      rank: args.rank,
      enabledFields: args.enabledFields,
      primaryMetric: args.primaryMetric,
      direction: args.direction,
      currentTarget: args.currentTarget,
      sessionCount: 0,
      status: 'active',
      createdAt: Date.now(),
    })
  },
})

export const update = mutation({
  args: {
    itemId: v.id('items'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    statTargets: v.optional(v.array(STAT)),
    rank: v.optional(RANK),
    enabledFields: v.optional(v.array(FIELD_KEY)),
    primaryMetric: v.optional(FIELD_KEY),
    direction: v.optional(DIRECTION),
    currentTarget: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<void> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Non authentifié')
    const item = await ctx.db.get(args.itemId)
    if (!item || item.userId !== userId) throw new Error('Item introuvable')

    // État résultant, pour valider les invariants sur la combinaison finale.
    const statTargets = args.statTargets ?? item.statTargets
    const enabledFields = args.enabledFields ?? item.enabledFields
    const primaryMetric = args.primaryMetric ?? item.primaryMetric
    validateItemShape(statTargets, enabledFields, primaryMetric)

    // Ne patche QUE les champs fournis. Ne touche jamais aux sessions.
    const patch: Partial<Doc<'items'>> = {}
    if (args.name !== undefined) patch.name = args.name.trim()
    if (args.description !== undefined) patch.description = args.description
    if (args.statTargets !== undefined) patch.statTargets = args.statTargets
    if (args.rank !== undefined) patch.rank = args.rank
    if (args.enabledFields !== undefined) patch.enabledFields = args.enabledFields
    if (args.primaryMetric !== undefined) patch.primaryMetric = args.primaryMetric
    if (args.direction !== undefined) patch.direction = args.direction as Direction
    if (args.currentTarget !== undefined) patch.currentTarget = args.currentTarget

    await ctx.db.patch(args.itemId, patch)
  },
})
