/**
 * Validators Convex partagés — source unique.
 *
 * Une caractéristique, un rang, un champ mesurable ou une direction se déclare
 * ICI et nulle part ailleurs. Aucun `v.union(...)` recopié inline dans un fichier
 * de fonctions (schema.ts, items.ts, sessions.ts...).
 *
 * Les types produits sont vérifiés, à la compilation, contre les tokens du design
 * system (`src/constants/theme.ts`) : si l'une des deux listes dérive de l'autre,
 * `tsc` échoue.
 */
import { v } from 'convex/values'
import type { Infer } from 'convex/values'
import type { Direction, FieldKey, Rank, Stat } from '../src/constants/theme'

// --- Caractéristiques (6) -------------------------------------------------
export const STAT = v.union(
  v.literal('VIT'),
  v.literal('END'),
  v.literal('FOR'),
  v.literal('AGI'),
  v.literal('TEC'),
  v.literal('VOL'),
)

// --- Rangs (9, E → SS+) ---------------------------------------------------
export const RANK = v.union(
  v.literal('E'),
  v.literal('D'),
  v.literal('C'),
  v.literal('B'),
  v.literal('A'),
  v.literal('S'),
  v.literal('S+'),
  v.literal('SS'),
  v.literal('SS+'),
)

// --- Champs mesurables (4) ------------------------------------------------
export const FIELD_KEY = v.union(
  v.literal('chrono'),
  v.literal('reps'),
  v.literal('rounds'),
  v.literal('load'),
)

// --- Direction de comparaison --------------------------------------------
export const DIRECTION = v.union(
  v.literal('higher_better'),
  v.literal('lower_better'),
)

// --- Valeurs mesurées d'une session --------------------------------------
// Seuls les champs activés sur l'item sont renseignés à l'enregistrement.
export const SESSION_VALUES = v.object({
  chrono: v.optional(v.number()),
  reps: v.optional(v.number()),
  rounds: v.optional(v.number()),
  load: v.optional(v.number()),
})

// --- Garde-fous de compilation : validators ⟺ design tokens ---------------
// Si un validator diverge des tokens de theme.ts, l'un de ces alias devient
// invalide et `tsc --noEmit` échoue. Aucun coût au runtime.
type _StatOk = Infer<typeof STAT> extends Stat ? (Stat extends Infer<typeof STAT> ? true : never) : never
type _RankOk = Infer<typeof RANK> extends Rank ? (Rank extends Infer<typeof RANK> ? true : never) : never
type _FieldOk = Infer<typeof FIELD_KEY> extends FieldKey ? (FieldKey extends Infer<typeof FIELD_KEY> ? true : never) : never
type _DirOk = Infer<typeof DIRECTION> extends Direction ? (Direction extends Infer<typeof DIRECTION> ? true : never) : never

const _assertStat: _StatOk = true
const _assertRank: _RankOk = true
const _assertField: _FieldOk = true
const _assertDir: _DirOk = true
void _assertStat
void _assertRank
void _assertField
void _assertDir
