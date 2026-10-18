/**
 * Circuits — enchaînements d'exercices autonomes (module sans XP, comme Running).
 *
 * Les exercices vivent inline dans `circuits.exercises` (aucun lien vers `items`,
 * non partageables). Le record du circuit = le pointeur `personalRecordSessionId`
 * vers la séance au plus grand `circuitReps` (plus haut = mieux). Le ledger
 * `circuitSessions` est append-only : aucune mutation d'UPDATE/DELETE n'y est
 * exposée (sauf purge via `archive`, déclenchée explicitement par le joueur).
 *
 * La comparaison de record réutilise `isBetter` (src/utils/xp.utils.ts), source
 * unique partagée avec le module Records.
 */
import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { isBetter } from '../src/utils/xp.utils'
import type { CircuitExercise } from '../src/utils/circuits.utils'
import type { Doc, Id } from './_generated/dataModel'
import type { QueryCtx } from './_generated/server'
import { mutation, query } from './_generated/server'
import { CIRCUIT_EXERCISE } from './validators'

/** Valide le plan d'un circuit. Lève une erreur explicite sinon. */
function validateExercises(exercises: readonly CircuitExercise[]): void {
  if (exercises.length < 1) {
    throw new Error('Un circuit doit contenir au moins un exercice.')
  }
  for (const e of exercises) {
    if (e.name.trim().length < 1) throw new Error('Chaque exercice doit avoir un nom.')
    if (!Number.isFinite(e.reps) || e.reps < 0) {
      throw new Error('Les répétitions doivent être un nombre positif.')
    }
    if (!Number.isFinite(e.load) || e.load < 0) {
      throw new Error('Le poids doit être un nombre positif ou nul.')
    }
  }
}

/** Normalise un plan : nom tronqué, nombres inchangés. */
function normalizeExercises(exercises: readonly CircuitExercise[]): CircuitExercise[] {
  return exercises.map((e) => ({ name: e.name.trim(), load: e.load, reps: e.reps }))
}

type EnrichedCircuit = { circuit: Doc<'circuits'>; record: Doc<'circuitSessions'> | null }

async function withRecord(ctx: QueryCtx, circuit: Doc<'circuits'>): Promise<EnrichedCircuit> {
  const record = circuit.personalRecordSessionId
    ? await ctx.db.get(circuit.personalRecordSessionId)
    : null
  return { circuit, record }
}

export const listActiveCircuits = query({
  args: {},
  handler: async (ctx): Promise<EnrichedCircuit[]> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []
    const circuits = await ctx.db
      .query('circuits')
      .withIndex('by_user_status', (q) => q.eq('userId', userId).eq('status', 'active'))
      .collect()
    return await Promise.all(circuits.map((c) => withRecord(ctx, c)))
  },
})

export const getCircuit = query({
  args: { circuitId: v.id('circuits') },
  handler: async (ctx, args): Promise<EnrichedCircuit | null> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null
    const circuit = await ctx.db.get(args.circuitId)
    if (!circuit || circuit.userId !== userId) return null
    return await withRecord(ctx, circuit)
  },
})

export const listSessions = query({
  args: { circuitId: v.id('circuits') },
  handler: async (ctx, args): Promise<Doc<'circuitSessions'>[]> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []
    const circuit = await ctx.db.get(args.circuitId)
    if (!circuit || circuit.userId !== userId) return []
    return await ctx.db
      .query('circuitSessions')
      .withIndex('by_circuit_date', (q) => q.eq('circuitId', args.circuitId))
      .order('desc')
      .collect()
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    exercises: v.array(CIRCUIT_EXERCISE),
  },
  handler: async (ctx, args): Promise<Id<'circuits'>> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Non authentifié')
    validateExercises(args.exercises)
    return await ctx.db.insert('circuits', {
      userId,
      name: args.name.trim(),
      description: args.description?.trim() || undefined,
      exercises: normalizeExercises(args.exercises),
      sessionCount: 0,
      status: 'active',
      createdAt: Date.now(),
    })
  },
})

export const update = mutation({
  args: {
    circuitId: v.id('circuits'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    exercises: v.optional(v.array(CIRCUIT_EXERCISE)),
  },
  handler: async (ctx, args): Promise<void> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Non authentifié')
    const circuit = await ctx.db.get(args.circuitId)
    if (!circuit || circuit.userId !== userId) throw new Error('Circuit introuvable')

    const patch: Partial<Doc<'circuits'>> = {}
    if (args.name !== undefined) patch.name = args.name.trim()
    if (args.description !== undefined) patch.description = args.description.trim() || undefined
    if (args.exercises !== undefined) {
      validateExercises(args.exercises)
      patch.exercises = normalizeExercises(args.exercises)
    }
    await ctx.db.patch(args.circuitId, patch)
  },
})

/**
 * Enregistre une séance de circuit (ledger append-only). Le nombre de tours du
 * circuit (`circuitReps`) est SAISI par le joueur, jamais déduit des entries :
 * record battu s'il dépasse celui du record courant. Ne crédite aucune XP : le
 * module Circuits est autonome, comme Running.
 */
export const recordSession = mutation({
  args: {
    circuitId: v.id('circuits'),
    entries: v.array(CIRCUIT_EXERCISE),
    circuitReps: v.number(),
    performedAt: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ sessionId: Id<'circuitSessions'>; isPersonalRecord: boolean; circuitReps: number }> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Non authentifié')
    const circuit = await ctx.db.get(args.circuitId)
    if (!circuit || circuit.userId !== userId) throw new Error('Circuit introuvable')
    validateExercises(args.entries)
    if (!Number.isFinite(args.circuitReps) || args.circuitReps < 1) {
      throw new Error('Indique combien de fois tu as répété le circuit (au moins 1).')
    }

    const best = circuit.personalRecordSessionId
      ? await ctx.db.get(circuit.personalRecordSessionId)
      : null
    const isPR = isBetter(args.circuitReps, best?.circuitReps, 'higher_better')

    const sessionId = await ctx.db.insert('circuitSessions', {
      userId,
      circuitId: args.circuitId,
      performedAt: args.performedAt,
      entries: normalizeExercises(args.entries),
      circuitReps: args.circuitReps,
      notes: args.notes?.trim() || undefined,
      isPersonalRecord: isPR,
      createdAt: Date.now(),
    })

    await ctx.db.patch(circuit._id, {
      sessionCount: circuit.sessionCount + 1,
      lastSessionAt: args.performedAt,
      ...(isPR ? { personalRecordSessionId: sessionId } : {}),
    })

    return { sessionId, isPersonalRecord: isPR, circuitReps: args.circuitReps }
  },
})

/**
 * Suppression côté joueur : le circuit est archivé (il disparaît de la liste)
 * ET son historique de séances est purgé. Le pointeur de record devient caduc,
 * on le retire. Exception assumée au caractère append-only du ledger, comme
 * pour `items.archive`.
 */
export const archive = mutation({
  args: { circuitId: v.id('circuits') },
  handler: async (ctx, args): Promise<void> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Non authentifié')
    const circuit = await ctx.db.get(args.circuitId)
    if (!circuit || circuit.userId !== userId) throw new Error('Circuit introuvable')

    const sessions = await ctx.db
      .query('circuitSessions')
      .withIndex('by_circuit_date', (q) => q.eq('circuitId', args.circuitId))
      .collect()
    for (const session of sessions) {
      await ctx.db.delete(session._id)
    }

    await ctx.db.patch(args.circuitId, {
      status: 'archived',
      personalRecordSessionId: undefined,
      lastSessionAt: undefined,
      sessionCount: 0,
    })
  },
})
