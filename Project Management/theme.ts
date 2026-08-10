/**
 * Design tokens — Ippo Leveling
 *
 * Source de vérité unique du design system. Aucune couleur, taille de police
 * ou durée d'animation ne doit être écrite en dur ailleurs dans le code.
 *
 * Direction artistique : "ceinture de champion".
 * Or/ambre primaire, rouge sang secondaire, dark mode exclusif.
 *
 * Note : il n'existe pas de token "warning". L'ambre primaire occupe déjà cette
 * teinte, donc les états d'alerte réutilisent Colors.crimson. Un seul rouge,
 * deux usages, zéro ambiguïté.
 */

// ---------------------------------------------------------------------------
// Couleurs
// ---------------------------------------------------------------------------

export const Colors = {
  // Surfaces
  background: '#050308',
  surface: '#0E0B14',
  surfaceElevated: '#171220',
  surfaceOverlay: 'rgba(5, 3, 8, 0.82)',

  // Accents
  gold: '#F5A524',
  goldSoft: '#FFD07A',
  goldDeep: '#B87A0E',
  crimson: '#E5384F',
  crimsonSoft: '#FF7A88',
  crimsonDeep: '#A31F32',

  // Texte
  textPrimary: '#F5F3F0',
  textSecondary: '#A8A29B',
  textMuted: '#6B665F',
  textDisabled: '#443F3A',
  onGold: '#412402',
  onCrimson: '#FFFFFF',

  // Bordures
  border: 'rgba(245, 165, 36, 0.14)',
  borderStrong: 'rgba(245, 165, 36, 0.30)',
  borderNeutral: 'rgba(245, 243, 240, 0.08)',

  // Sémantique
  success: '#22C55E',
  successBg: 'rgba(34, 197, 94, 0.12)',
  danger: '#DC2626',
  dangerBg: 'rgba(220, 38, 38, 0.12)',
  info: '#38BDF8',
  infoBg: 'rgba(56, 189, 248, 0.12)',
} as const

// ---------------------------------------------------------------------------
// Rangs — 9 paliers, E à SS+
// ---------------------------------------------------------------------------

export const RANKS = ['E', 'D', 'C', 'B', 'A', 'S', 'S+', 'SS', 'SS+'] as const
export type Rank = (typeof RANKS)[number]

export const RANK_CONFIG = {
  'E':   { label: 'Trivial',          color: '#64748B', onColor: '#0B0B0B', xp: 10 },
  'D':   { label: 'Simple',           color: '#34D399', onColor: '#04342C', xp: 25 },
  'C':   { label: 'Moyen',            color: '#38BDF8', onColor: '#042C53', xp: 50 },
  'B':   { label: 'Difficile',        color: '#A78BFA', onColor: '#26215C', xp: 100 },
  'A':   { label: 'Haut niveau',      color: '#F5A524', onColor: '#412402', xp: 200 },
  'S':   { label: 'Élite',            color: '#FB7233', onColor: '#4A1B0C', xp: 400 },
  'S+':  { label: 'Élite supérieur',  color: '#FF5A3C', onColor: '#4A1B0C', xp: 700 },
  'SS':  { label: 'Exceptionnel',     color: '#E5384F', onColor: '#FFFFFF', xp: 1200 },
  'SS+': { label: 'Légendaire',       color: '#FCE7A2', onColor: '#412402', xp: 2000 },
} as const satisfies Record<Rank, { label: string; color: string; onColor: string; xp: number }>

export const RANK_XP = Object.fromEntries(
  RANKS.map((r) => [r, RANK_CONFIG[r].xp]),
) as Record<Rank, number>

// ---------------------------------------------------------------------------
// Caractéristiques
// ---------------------------------------------------------------------------

export const STATS = ['VIT', 'END', 'FOR', 'AGI', 'TEC', 'VOL'] as const
export type Stat = (typeof STATS)[number]

export const STAT_CONFIG = {
  VIT: { label: 'Vitesse',   color: '#22D3EE', xpKey: 'vit_xp', icon: 'flash' },
  END: { label: 'Endurance', color: '#34D399', xpKey: 'end_xp', icon: 'lungs' },
  FOR: { label: 'Force',     color: '#E5384F', xpKey: 'for_xp', icon: 'barbell' },
  AGI: { label: 'Agilité',   color: '#A78BFA', xpKey: 'agi_xp', icon: 'move' },
  TEC: { label: 'Technique', color: '#F5A524', xpKey: 'tec_xp', icon: 'target' },
  VOL: { label: 'Volonté',   color: '#E5E7EB', xpKey: 'vol_xp', icon: 'flame' },
} as const satisfies Record<Stat, { label: string; color: string; xpKey: string; icon: string }>

// ---------------------------------------------------------------------------
// Champs mesurables
// ---------------------------------------------------------------------------

export const FIELD_KEYS = ['chrono', 'reps', 'rounds', 'load'] as const
export type FieldKey = (typeof FIELD_KEYS)[number]

export type Direction = 'higher_better' | 'lower_better'

export const FIELD_CONFIG = {
  chrono: { label: 'Chrono',        unit: 's',     defaultDirection: 'lower_better'  as Direction, icon: 'stopwatch' },
  reps:   { label: 'Répétitions',   unit: 'rep',   defaultDirection: 'higher_better' as Direction, icon: 'repeat' },
  rounds: { label: 'Rounds',        unit: 'round', defaultDirection: 'higher_better' as Direction, icon: 'bell' },
  load:   { label: 'Charge',        unit: 'kg',    defaultDirection: 'higher_better' as Direction, icon: 'weight' },
} as const satisfies Record<FieldKey, { label: string; unit: string; defaultDirection: Direction; icon: string }>

// ---------------------------------------------------------------------------
// Typographie
// ---------------------------------------------------------------------------

/**
 * Chargement via expo-font dans app/_layout.tsx.
 * Bebas Neue n'a pas de bas-de-casse distinctif : réservé aux titres et aux
 * valeurs numériques mises en avant. Bascule possible vers Oswald.
 */
export const Fonts = {
  display: 'BebasNeue_400Regular',
  ui: 'Inter_400Regular',
  uiMedium: 'Inter_500Medium',
  uiBold: 'Inter_700Bold',
  mono: 'JetBrainsMono_400Regular',
  monoBold: 'JetBrainsMono_700Bold',
} as const

export const Typography = {
  hero:       { fontFamily: Fonts.display,  fontSize: 44, lineHeight: 46, letterSpacing: 1.5 },
  h1:         { fontFamily: Fonts.display,  fontSize: 32, lineHeight: 36, letterSpacing: 1.2 },
  h2:         { fontFamily: Fonts.display,  fontSize: 24, lineHeight: 28, letterSpacing: 1.0 },
  h3:         { fontFamily: Fonts.uiBold,   fontSize: 18, lineHeight: 24, letterSpacing: 0 },
  bodyLarge:  { fontFamily: Fonts.ui,       fontSize: 17, lineHeight: 26, letterSpacing: 0 },
  body:       { fontFamily: Fonts.ui,       fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  bodySmall:  { fontFamily: Fonts.ui,       fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  label:      { fontFamily: Fonts.uiMedium, fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
  caption:    { fontFamily: Fonts.ui,       fontSize: 11, lineHeight: 14, letterSpacing: 0.4 },
  // Chiffres tabulaires. Obligatoire partout où un nombre change en place.
  data:       { fontFamily: Fonts.mono,     fontSize: 14, lineHeight: 18, letterSpacing: 0.4 },
  recordValue:{ fontFamily: Fonts.monoBold, fontSize: 40, lineHeight: 44, letterSpacing: 1.0 },
} as const

// ---------------------------------------------------------------------------
// Espacement, rayons, layout
// ---------------------------------------------------------------------------

export const Spacing = {
  xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48,
} as const

export const Radius = {
  sm: 6, md: 10, lg: 14, xl: 20, pill: 999,
} as const

export const Layout = {
  screenPadding: Spacing.lg,
  cardPadding: Spacing.lg,
  tabBarHeight: 64,
  minTouchTarget: 48,
  maxContentWidth: 560, // borne la largeur en web
} as const

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------

/**
 * Animations GPU-only : transform et opacity uniquement.
 * Jamais de width, height, top ou left animés.
 */
export const Motion = {
  fast: 120,
  base: 240,
  slow: 400,
  celebration: 900,
  easing: {
    standard: [0.2, 0.8, 0.2, 1] as const,
    overshoot: [0.34, 1.56, 0.64, 1] as const,
    decelerate: [0, 0, 0.2, 1] as const,
  },
  pressScale: 0.97,
} as const

// ---------------------------------------------------------------------------
// Constantes de progression
// ---------------------------------------------------------------------------

export const XP_CURVE_FACTOR = 77
export const XP_CURVE_EXPONENT = 1.5
export const PERSONAL_RECORD_MULTIPLIER = 1.5
export const STAT_COUNT = STATS.length

/** Bonus de régularité sur la Volonté, par semaine glissante. */
export const CONSISTENCY_TIERS = [
  { sessions: 3, xp: 50 },
  { sessions: 5, xp: 150 },
  { sessions: 7, xp: 300 },
] as const
