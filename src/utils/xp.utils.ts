/**
 * Fonctions pures de progression — SPEC §4.5 et §6.
 *
 * UN SEUL fichier, DEUX consommateurs : le client (prévisualisation d'XP) et
 * Convex (autorité). Jamais de copie. Toute divergence client/serveur vient
 * d'une recopie de cette logique — c'est interdit.
 *
 * Les imports sont volontairement RELATIFS (pas d'alias `@/`) : ce fichier est
 * bundlé par Convex (esbuild), qui ne connaît pas les alias de tsconfig.
 */
import {
  PERSONAL_RECORD_MULTIPLIER,
  RANK_XP,
  STAT_COUNT,
  XP_CURVE_EXPONENT,
  XP_CURVE_FACTOR,
  type Direction,
  type Rank,
} from '../constants/theme'

/**
 * Comparateur de record. Gère les DEUX directions.
 *
 * - `higher_better` : une valeur plus grande est meilleure (reps, rounds, load).
 * - `lower_better`  : une valeur plus PETITE est meilleure (chrono).
 *
 * Sans record existant (`best === undefined`), toute première valeur est un record.
 */
export const isBetter = (
  value: number,
  best: number | undefined,
  direction: Direction,
): boolean => {
  if (best === undefined) return true
  return direction === 'higher_better' ? value > best : value < best
}

/** XP de base d'un rang (E → SS+). */
export const rankBaseXp = (rank: Rank): number => RANK_XP[rank]

/** Multiplicateur appliqué quand la session bat le record personnel. */
export const recordMultiplier = (isPersonalRecord: boolean): number =>
  isPersonalRecord ? PERSONAL_RECORD_MULTIPLIER : 1

/**
 * XP créditée À CHAQUE caractéristique ciblée (SPEC §6.2).
 *
 * L'XP du rang est répartie à PARTS ÉGALES entre les caractéristiques, puis
 * multipliée par le bonus record. Jamais l'XP entière à chacune.
 *
 *   xpParStat = round( RANK_XP[rank] × multiplicateurRecord / statCount )
 */
export const xpPerStat = (
  rank: Rank,
  statCount: number,
  isPersonalRecord: boolean,
): number => {
  if (statCount < 1) {
    throw new Error('statCount doit être >= 1')
  }
  const total = rankBaseXp(rank) * recordMultiplier(isPersonalRecord)
  return Math.round(total / statCount)
}

/**
 * Courbe de niveau de la franchise (SPEC §6.5).
 *
 *   XP_requis(n) = 77 × (n - 1)^1.5      // niveau 1 = 0 XP
 */
export const xpForLevel = (level: number): number => {
  if (level <= 1) return 0
  return XP_CURVE_FACTOR * Math.pow(level - 1, XP_CURVE_EXPONENT)
}

/** Niveau atteint pour une quantité d'XP donnée (inverse de {@link xpForLevel}). */
export const levelFromXp = (xp: number): number => {
  if (xp <= 0) return 1
  return Math.floor(1 + Math.pow(xp / XP_CURVE_FACTOR, 1 / XP_CURVE_EXPONENT))
}

/**
 * Niveau global : récompense l'équilibre, pas la spécialisation (SPEC §6.6).
 *
 *   globalLevel = levelFromXP( moyenne des six caractéristiques )
 */
export const globalLevelFromStats = (statXps: readonly number[]): number => {
  if (statXps.length === 0) return 1
  const total = statXps.reduce((sum, x) => sum + x, 0)
  return levelFromXp(total / STAT_COUNT)
}

/** Progression (0 → 1) à l'intérieur du niveau courant, pour une barre d'XP. */
export const levelProgress = (xp: number): number => {
  const level = levelFromXp(xp)
  const floor = xpForLevel(level)
  const ceil = xpForLevel(level + 1)
  if (ceil <= floor) return 0
  return (xp - floor) / (ceil - floor)
}
