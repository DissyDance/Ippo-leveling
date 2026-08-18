/**
 * Feedback — récolte de suggestions joueurs.
 *
 * Table append-only côté joueur : `submit` insère, la lecture et la suppression
 * sont réservées à la CLI (internal). Aucun joueur ne lit le feedback d'autrui.
 */
import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { internalMutation, internalQuery, mutation } from './_generated/server'

export const submit = mutation({
  args: { message: v.string() },
  handler: async (ctx, { message }) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Non authentifié')

    const trimmed = message.trim()
    if (trimmed.length === 0) throw new Error('Message requis')
    if (trimmed.length > 2000) throw new Error('Message trop long (2000 caractères max)')

    await ctx.db.insert('feedback', { userId, message: trimmed, createdAt: Date.now() })
  },
})

/** CLI-only : `npx convex run feedback:listAll` (ajouter --prod pour la prod). */
export const listAll = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('feedback').order('desc').collect()
  },
})

/** CLI-only : `npx convex run feedback:remove '{"id":"<_id>"}'` (--prod pour la prod). */
export const remove = internalMutation({
  args: { id: v.id('feedback') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
