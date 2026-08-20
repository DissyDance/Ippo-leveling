/**
 * Running — calculs purs partagés (formulaire, dashboard, records).
 *
 * Aucune donnée dérivée (vitesse, allure, records) n'est stockée : tout se
 * recalcule ici depuis les mesures brutes (distance en mètres, temps en
 * secondes). Fonctions pures, testables, sans dépendance React/Convex.
 */

/** Mesures brutes minimales d'une course. Compatible avec Doc<'runs'>. */
export type RunLike = {
  distanceMeters: number
  durationSeconds: number
  performedAt: number
}

// --- Saisie / affichage du temps (hh:mm:ss) --------------------------------

/**
 * Parse un temps saisi en secondes. Accepte « h:mm:ss », « mm:ss » ou un
 * nombre seul (interprété en minutes). Renvoie null si invalide.
 */
export function parseDuration(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') return null
  const parts = trimmed.split(':').map((p) => p.trim())
  if (parts.some((p) => p === '' || !/^\d+([.,]\d+)?$/.test(p))) return null
  const nums = parts.map((p) => Number.parseFloat(p.replace(',', '.')))
  const at = (i: number): number => nums[i] ?? 0
  let seconds: number
  if (nums.length === 1) seconds = at(0) * 60 // un nombre seul = minutes
  else if (nums.length === 2) seconds = at(0) * 60 + at(1)
  else if (nums.length === 3) seconds = at(0) * 3600 + at(1) * 60 + at(2)
  else return null
  return seconds > 0 ? Math.round(seconds) : null
}

const pad = (n: number): string => String(n).padStart(2, '0')

/** Formate des secondes en « h:mm:ss » (≥ 1 h) ou « m:ss ». */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`
}

// --- Distance --------------------------------------------------------------

/** Parse une distance saisie en km (« 8,5 ») vers des mètres. null si invalide. */
export function parseDistanceKm(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === '' || !/^\d+([.,]\d+)?$/.test(trimmed)) return null
  const km = Number.parseFloat(trimmed.replace(',', '.'))
  return km > 0 ? Math.round(km * 1000) : null
}

/** Mètres → km arrondi à `digits` décimales. */
export function metersToKm(meters: number, digits = 2): number {
  return Number((meters / 1000).toFixed(digits))
}

/** « 8.5 km » — distance lisible. */
export function formatDistance(meters: number): string {
  return `${metersToKm(meters).toString()} km`
}

// --- Vitesse / allure ------------------------------------------------------

/** Vitesse moyenne en km/h. 0 si temps nul. */
export function speedKmh(meters: number, seconds: number): number {
  if (seconds <= 0) return 0
  return meters / 1000 / (seconds / 3600)
}

/** « 11.3 km/h ». */
export function formatSpeed(meters: number, seconds: number): string {
  return `${speedKmh(meters, seconds).toFixed(1)} km/h`
}

/** Allure « 5:19 /km ». '—' si distance nulle. */
export function formatPace(meters: number, seconds: number): string {
  if (meters <= 0 || seconds <= 0) return '—'
  const secPerKm = seconds / (meters / 1000)
  return `${formatDuration(secPerKm)} /km`
}

// --- Filtres temporels -----------------------------------------------------

export type Period = 'week' | 'month' | 'semester' | 'year' | 'all'

export const PERIODS: { key: Period; label: string }[] = [
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' },
  { key: 'semester', label: 'Semestre' },
  { key: 'year', label: 'Année' },
  { key: 'all', label: 'Tout' },
]

/** Début (ms) de la période calendaire courante. 'all' → 0. */
export function periodStart(period: Period, now: number = Date.now()): number {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  switch (period) {
    case 'week': {
      const dayFromMonday = (d.getDay() + 6) % 7 // lundi = 0
      d.setDate(d.getDate() - dayFromMonday)
      return d.getTime()
    }
    case 'month':
      d.setDate(1)
      return d.getTime()
    case 'semester':
      d.setMonth(d.getMonth() < 6 ? 0 : 6, 1)
      return d.getTime()
    case 'year':
      d.setMonth(0, 1)
      return d.getTime()
    case 'all':
      return 0
  }
}

/** Courses dont `performedAt` tombe dans la période. */
export function filterByPeriod<T extends RunLike>(runs: T[], period: Period, now?: number): T[] {
  const start = periodStart(period, now)
  return runs.filter((r) => r.performedAt >= start)
}

// --- Agrégats & records ----------------------------------------------------

export type RunSummary = {
  totalDistanceMeters: number
  totalDurationSeconds: number
  count: number
  /** Vitesse moyenne globale sur l'ensemble (distance/temps cumulés). */
  avgSpeedKmh: number
}

export function summarize(runs: RunLike[]): RunSummary {
  let dist = 0
  let dur = 0
  for (const r of runs) {
    dist += r.distanceMeters
    dur += r.durationSeconds
  }
  return {
    totalDistanceMeters: dist,
    totalDurationSeconds: dur,
    count: runs.length,
    avgSpeedKmh: speedKmh(dist, dur),
  }
}

export type Records<T extends RunLike> = {
  longestDistance: T | null
  fastestSpeed: T | null
  longestDuration: T | null
  /** Temps équivalent (s) projeté sur 5 km depuis l'allure moyenne. */
  best5k: { seconds: number; run: T } | null
  best10k: { seconds: number; run: T } | null
}

/** Meilleur temps équivalent sur `refMeters`, parmi les courses ≥ cette distance. */
function bestEquiv<T extends RunLike>(runs: T[], refMeters: number): { seconds: number; run: T } | null {
  let best: { seconds: number; run: T } | null = null
  for (const r of runs) {
    if (r.distanceMeters < refMeters || r.durationSeconds <= 0) continue
    const seconds = r.durationSeconds * (refMeters / r.distanceMeters)
    if (!best || seconds < best.seconds) best = { seconds, run: r }
  }
  return best
}

export function computeRecords<T extends RunLike>(runs: T[]): Records<T> {
  let longestDistance: T | null = null
  let fastestSpeed: T | null = null
  let longestDuration: T | null = null
  for (const r of runs) {
    if (!longestDistance || r.distanceMeters > longestDistance.distanceMeters) longestDistance = r
    if (!longestDuration || r.durationSeconds > longestDuration.durationSeconds) longestDuration = r
    if (
      r.durationSeconds > 0 &&
      (!fastestSpeed || speedKmh(r.distanceMeters, r.durationSeconds) > speedKmh(fastestSpeed.distanceMeters, fastestSpeed.durationSeconds))
    ) {
      fastestSpeed = r
    }
  }
  return {
    longestDistance,
    fastestSpeed,
    longestDuration,
    best5k: bestEquiv(runs, 5000),
    best10k: bestEquiv(runs, 10000),
  }
}
