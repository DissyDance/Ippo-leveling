/**
 * Joueur — profil et XP par caractéristique.
 *
 * `players` est mutable (contrairement aux ledgers sessions/xpLogs). Le profil
 * (nom, taille, poids) est purement informatif : aucune logique métier n'en dépend.
 */
import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/** Le joueur courant, ou `null` si pas encore créé (auth gate → onboarding). */
export const getCurrentPlayer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null
    return await ctx.db
      .query('players')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .unique()
  },
})

/**
 * Crée le joueur s'il n'existe pas, sinon met à jour les champs de profil fournis.
 * Appelée aussi bien par « Enregistrer » que par « Passer » (sans argument) de
 * l'onboarding : dans les deux cas le joueur existe ensuite, et le gate laisse
 * passer vers les tabs.
 */
export const ensureProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    heightCm: v.optional(v.number()),
    weightKg: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Non authentifié')

    const existing = await ctx.db
      .query('players')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...(args.displayName !== undefined ? { displayName: args.displayName } : {}),
        ...(args.heightCm !== undefined ? { heightCm: args.heightCm } : {}),
        ...(args.weightKg !== undefined ? { weightKg: args.weightKg } : {}),
      })
      return existing._id
    }

    return await ctx.db.insert('players', {
      userId,
      displayName: args.displayName,
      heightCm: args.heightCm,
      weightKg: args.weightKg,
      vit_xp: 0,
      end_xp: 0,
      for_xp: 0,
      agi_xp: 0,
      tec_xp: 0,
      vol_xp: 0,
      createdAt: Date.now(),
    })
  },
})
