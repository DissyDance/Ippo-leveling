/**
 * Bonus de régularité (SPEC §6.4) — seule source automatique de Volonté.
 *
 * Sur la semaine glissante (7 jours), crédite le palier franchi :
 *   3 sessions → 50 · 5 → 150 · 7 → 300.
 * Chaque palier n'est crédité QU'UNE fois par semaine. Jamais de retrait.
 * Tracé en xpLogs avec kind:'consistency' sur la caractéristique VOL.
 */
import { CONSISTENCY_TIERS, STAT_CONFIG } from '../../src/constants/theme'
import type { Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000
const VOL_XP_KEY = STAT_CONFIG.VOL.xpKey

const tierLabel = (sessions: number): string => `Régularité — ${sessions} sessions/semaine`

export type ConsistencyResult = {
  xp: number
  tiers: number[] // paliers (nombre de sessions) crédités lors de cet appel
}

export async function applyConsistencyBonus(
  ctx: MutationCtx,
  userId: Id<'users'>,
  triggeringSessionId: Id<'sessions'>,
): Promise<ConsistencyResult> {
  const since = Date.now() - WEEK_MS

  const recentSessions = await ctx.db
    .query('sessions')
    .withIndex('by_user_date', (q) => q.eq('userId', userId).gte('performedAt', since))
    .collect()
  const count = recentSessions.length

  const recentLogs = await ctx.db
    .query('xpLogs')
    .withIndex('by_user_date', (q) => q.eq('userId', userId).gte('loggedAt', since))
    .collect()
  const alreadyCredited = new Set(
    recentLogs.filter((l) => l.kind === 'consistency').map((l) => l.label),
  )

  const now = Date.now()
  let gained = 0
  const tiers: number[] = []

  for (const tier of CONSISTENCY_TIERS) {
    const label = tierLabel(tier.sessions)
    if (count >= tier.sessions && !alreadyCredited.has(label)) {
      await ctx.db.insert('xpLogs', {
        userId,
        sessionId: triggeringSessionId,
        kind: 'consistency',
        stat: 'VOL',
        amount: tier.xp,
        label,
        loggedAt: now,
      })
      gained += tier.xp
      tiers.push(tier.sessions)
    }
  }

  if (gained > 0) {
    const player = await ctx.db
      .query('players')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .unique()
    if (player) {
      await ctx.db.patch(player._id, { [VOL_XP_KEY]: player[VOL_XP_KEY] + gained })
    }
  }

  return { xp: gained, tiers }
}
