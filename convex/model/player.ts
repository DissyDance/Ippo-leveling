/**
 * Helpers joueur, réutilisés par les mutations. Un seul point d'accès au doc
 * `players` pour garder la logique XP cohérente.
 */
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

export async function findPlayer(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'users'>,
): Promise<Doc<'players'> | null> {
  return await ctx.db
    .query('players')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .unique()
}

export async function requirePlayer(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'users'>,
): Promise<Doc<'players'>> {
  const player = await findPlayer(ctx, userId)
  if (!player) throw new Error('Joueur introuvable')
  return player
}
