/**
 * Sessions — ledger append-only (SPEC §5.3, §7.2).
 *
 * `record` est la mutation centrale. Convex garantit l'atomicité du handler.
 * AUCUNE mutation d'UPDATE ou de DELETE n'est exposée sur cette table.
 *
 * La logique d'XP (isBetter, répartition) vient de src/utils/xp.utils.ts — le
 * MÊME fichier que la prévisualisation client. Jamais de copie.
 */
import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { STAT_CONFIG, STATS } from '../src/constants/theme'
import { globalLevelFromStats, isBetter, xpPerStat } from '../src/utils/xp.utils'
import type { Doc } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import { applyConsistencyBonus } from './model/consistency'
import { requirePlayer } from './model/player'
import { SESSION_VALUES } from './validators'

type XpKey = (typeof STAT_CONFIG)[keyof typeof STAT_CONFIG]['xpKey']

const statXpArray = (player: Doc<'players'>): number[] =>
  STATS.map((s) => player[STAT_CONFIG[s].xpKey])

export const listByItem = query({
  args: { itemId: v.id('items') },
  handler: async (ctx, args): Promise<Doc<'sessions'>[]> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []
    const item = await ctx.db.get(args.itemId)
    if (!item || item.userId !== userId) return []
    return await ctx.db
      .query('sessions')
      .withIndex('by_item_date', (q) => q.eq('itemId', args.itemId))
      .order('desc')
      .collect()
  },
})

export const record = mutation({
  args: {
    itemId: v.id('items'),
    values: SESSION_VALUES,
    performedAt: v.number(),
    nextTarget: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Non authentifié')

    const item = await ctx.db.get(args.itemId)
    if (!item || item.userId !== userId) throw new Error('Item introuvable')

    const primaryValue = args.values[item.primaryMetric]
    if (primaryValue === undefined) {
      throw new Error('Métrique principale manquante dans les valeurs saisies.')
    }

    const best = item.personalRecordSessionId
      ? await ctx.db.get(item.personalRecordSessionId)
      : null
    const isPR = isBetter(primaryValue, best?.primaryValue, item.direction)

    const player = await requirePlayer(ctx, userId)
    const levelBefore = globalLevelFromStats(statXpArray(player))

    const perStat = xpPerStat(item.rank, item.statTargets.length, isPR)
    const xpGained = perStat * item.statTargets.length

    // 1. Session (append-only), primaryValue dénormalisé.
    const sessionId = await ctx.db.insert('sessions', {
      userId,
      itemId: args.itemId,
      performedAt: args.performedAt,
      values: args.values,
      primaryValue,
      nextTarget: args.nextTarget,
      notes: args.notes,
      xpGained,
      isPersonalRecord: isPR,
      createdAt: Date.now(),
    })

    // 2. XP répartie à parts égales + trace par caractéristique.
    const now = Date.now()
    const playerPatch: Partial<Record<XpKey, number>> = {}
    for (const stat of item.statTargets) {
      const key = STAT_CONFIG[stat].xpKey
      playerPatch[key] = player[key] + perStat
      await ctx.db.insert('xpLogs', {
        userId,
        sessionId,
        kind: 'session',
        stat,
        amount: perStat,
        label: item.name,
        loggedAt: now,
      })
    }
    await ctx.db.patch(player._id, playerPatch)

    // 3. Item : compteur, dernière date, objectif, pointeur de record si battu.
    await ctx.db.patch(item._id, {
      sessionCount: item.sessionCount + 1,
      lastSessionAt: args.performedAt,
      currentTarget: args.nextTarget ?? item.currentTarget,
      ...(isPR ? { personalRecordSessionId: sessionId } : {}),
    })

    // 4. Bonus de régularité (Volonté).
    const consistency = await applyConsistencyBonus(ctx, userId, sessionId)

    // 5. Niveau global après tous les crédits.
    const after = STATS.map((s) => {
      const key = STAT_CONFIG[s].xpKey
      const base = playerPatch[key] ?? player[key]
      return key === STAT_CONFIG.VOL.xpKey ? base + consistency.xp : base
    })
    const levelAfter = globalLevelFromStats(after)

    return {
      sessionId,
      isPersonalRecord: isPR,
      xpPerStat: perStat,
      xpGained,
      stats: item.statTargets,
      consistency,
      levelBefore,
      levelAfter,
    }
  },
})
