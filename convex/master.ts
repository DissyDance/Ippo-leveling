/**
 * Pont Leveling Master 2 → Ippo Leveling.
 *
 * Master (déploiement Convex séparé) interroge cet endpoint en lecture seule
 * pour lister les entraînements du joueur et leur nombre de séances, afin de :
 *   - proposer un item (ou le module Running) à importer comme quête ;
 *   - détecter une nouvelle séance (sessionCount qui augmente) et valider la
 *     quête liée côté Master.
 *
 * L'authentification est un secret partagé (`IPPO_APP_SECRET`), vérifié dans la
 * route HTTP (voir convex/http.ts). L'identité du joueur est résolue par email
 * Google (les deux apps utilisent Convex Auth Google).
 */
import { v } from 'convex/values'
import { internalQuery } from './_generated/server'

/**
 * Données joueur consommées par Master : items actifs (avec compteur de séances)
 * + résumé du module Running. Résout l'utilisateur par email. Renvoie `null` si
 * aucun compte Ippo n'existe pour cet email.
 */
export const playerDataByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query('users')
      .withIndex('email', (q) => q.eq('email', email))
      .unique()
    if (!user) return null

    const items = await ctx.db
      .query('items')
      .withIndex('by_user_status', (q) => q.eq('userId', user._id).eq('status', 'active'))
      .collect()

    const runs = await ctx.db
      .query('runs')
      .withIndex('by_user_date', (q) => q.eq('userId', user._id))
      .collect()
    let lastRunAt: number | null = null
    for (const r of runs) {
      if (lastRunAt === null || r.performedAt > lastRunAt) lastRunAt = r.performedAt
    }

    return {
      items: items.map((i) => ({
        id: i._id as string,
        name: i.name,
        category: i.category ?? null,
        rank: i.rank,
        statTargets: i.statTargets,
        sessionCount: i.sessionCount,
        lastSessionAt: i.lastSessionAt ?? null,
      })),
      running: { runCount: runs.length, lastRunAt },
    }
  },
})
