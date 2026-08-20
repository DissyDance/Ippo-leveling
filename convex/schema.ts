/**
 * Schéma Convex — source de vérité des données (SPEC §5).
 *
 * `sessions` et `xpLogs` sont des ledgers append-only : aucune mutation d'UPDATE
 * ni de DELETE n'est exposée dessus. Le record personnel n'est pas une table,
 * c'est le pointeur `items.personalRecordSessionId` vers une session.
 */
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { authTables } from '@convex-dev/auth/server'
import { DIRECTION, FIELD_KEY, RANK, SESSION_VALUES, STAT } from './validators'

export default defineSchema({
  // Tables de Convex Auth (users, authAccounts, authSessions, ...).
  ...authTables,

  players: defineTable({
    userId: v.id('users'),

    displayName: v.optional(v.string()),
    heightCm: v.optional(v.number()), // informatif, aucune logique métier
    weightKg: v.optional(v.number()), // informatif, aucune logique métier

    vit_xp: v.number(),
    end_xp: v.number(),
    for_xp: v.number(),
    agi_xp: v.number(),
    tec_xp: v.number(),
    vol_xp: v.number(),

    createdAt: v.number(),
  }).index('by_user', ['userId']),

  items: defineTable({
    userId: v.id('users'),

    name: v.string(),
    description: v.optional(v.string()),
    statTargets: v.array(STAT), // 1 à 6, non vide
    rank: RANK, // E → SS+

    enabledFields: v.array(FIELD_KEY), // sous-ensemble non vide de chrono|reps|rounds|load
    primaryMetric: FIELD_KEY, // doit appartenir à enabledFields
    direction: DIRECTION,

    personalRecordSessionId: v.optional(v.id('sessions')),
    currentTarget: v.optional(v.number()), // objectif en cours, unité de primaryMetric
    sessionCount: v.number(),
    lastSessionAt: v.optional(v.number()),

    status: v.union(v.literal('active'), v.literal('archived')),
    createdAt: v.number(),
  })
    .index('by_user_status', ['userId', 'status'])
    .index('by_user_rank', ['userId', 'rank']),

  // Ledger append-only.
  sessions: defineTable({
    userId: v.id('users'),
    itemId: v.id('items'),

    performedAt: v.number(), // pré-rempli au jour courant, modifiable

    values: SESSION_VALUES, // seuls les champs activés sont renseignés

    primaryValue: v.number(), // dénormalisé depuis values[primaryMetric]
    nextTarget: v.optional(v.number()), // objectif que le joueur se fixe
    notes: v.optional(v.string()),

    xpGained: v.number(),
    isPersonalRecord: v.boolean(),

    createdAt: v.number(),
  })
    .index('by_item_date', ['itemId', 'performedAt'])
    .index('by_user_date', ['userId', 'performedAt']),

  // Module Running — journal de courses. CRUD complet (contrairement au ledger
  // `sessions` des exercices) : distance et temps sont des mesures brutes, la
  // vitesse moyenne et les records sont dérivés côté lecture, jamais stockés.
  runs: defineTable({
    userId: v.id('users'),
    performedAt: v.number(), // jour de la course, pré-rempli au jour courant
    distanceMeters: v.number(), // > 0
    durationSeconds: v.number(), // > 0
    createdAt: v.number(),
  }).index('by_user_date', ['userId', 'performedAt']),

  // Feedback joueurs. Lecture/suppression réservées à la CLI (internal).
  feedback: defineTable({
    userId: v.id('users'),
    message: v.string(),
    createdAt: v.number(),
  }).index('by_user', ['userId']),

  // Trace de tout crédit d'XP, par caractéristique. Append-only.
  xpLogs: defineTable({
    userId: v.id('users'),
    sessionId: v.optional(v.id('sessions')),
    kind: v.union(v.literal('session'), v.literal('consistency')),
    stat: STAT,
    amount: v.number(),
    label: v.string(),
    loggedAt: v.number(),
  })
    .index('by_user_date', ['userId', 'loggedAt'])
    .index('by_user_stat', ['userId', 'stat']),
})
