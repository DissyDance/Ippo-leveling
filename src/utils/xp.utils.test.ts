import {
  globalLevelFromStats,
  isBetter,
  levelFromXp,
  levelProgress,
  xpForLevel,
  xpPerStat,
} from './xp.utils'

describe('isBetter — comparateur de record', () => {
  test('higher_better : une valeur plus grande gagne', () => {
    expect(isBetter(20, 15, 'higher_better')).toBe(true)
    expect(isBetter(10, 15, 'higher_better')).toBe(false)
    expect(isBetter(15, 15, 'higher_better')).toBe(false) // égalité ≠ record
  })

  // CAS CRITIQUE du projet : un chrono plus BAS est un meilleur record.
  test('lower_better : une valeur plus PETITE gagne (chrono)', () => {
    expect(isBetter(12, 15, 'lower_better')).toBe(true) // 12s bat 15s
    expect(isBetter(18, 15, 'lower_better')).toBe(false) // 18s ne bat pas 15s
    expect(isBetter(15, 15, 'lower_better')).toBe(false) // égalité ≠ record
    expect(isBetter(9.8, 10.1, 'lower_better')).toBe(true) // décimales
  })

  test('sans record existant, toute première valeur est un record', () => {
    expect(isBetter(0, undefined, 'higher_better')).toBe(true)
    expect(isBetter(999, undefined, 'lower_better')).toBe(true)
  })
})

describe('xpPerStat — répartition de l’XP (SPEC §6.2)', () => {
  test('répartie à parts égales entre les caractéristiques ciblées', () => {
    // Rang B (100 XP) sur 3 stats, sans record → 33 à CHACUNE (pas 100).
    expect(xpPerStat('B', 3, false)).toBe(33)
  })

  test('bonus record ×1.5 appliqué avant la division', () => {
    // Rang B (100) × 1.5 = 150, / 3 = 50 par stat.
    expect(xpPerStat('B', 3, true)).toBe(50)
  })

  test('une seule caractéristique reçoit l’XP entière du rang', () => {
    expect(xpPerStat('B', 1, false)).toBe(100)
    expect(xpPerStat('B', 1, true)).toBe(150)
  })

  test('arrondi correct sur division non entière', () => {
    // Rang A (200) sur 6 stats → round(33.33) = 33.
    expect(xpPerStat('A', 6, false)).toBe(33)
    // Rang E (10) sur 3 → round(3.33) = 3.
    expect(xpPerStat('E', 3, false)).toBe(3)
  })

  test('statCount invalide lève une erreur', () => {
    expect(() => xpPerStat('B', 0, false)).toThrow()
  })
})

describe('courbe de niveau (SPEC §6.5 / §6.6)', () => {
  test('niveau 1 = 0 XP', () => {
    expect(xpForLevel(1)).toBe(0)
    expect(levelFromXp(0)).toBe(1)
  })

  test('XP_requis(n) = 77 × (n-1)^1.5', () => {
    expect(xpForLevel(2)).toBeCloseTo(77)
    expect(xpForLevel(5)).toBeCloseTo(77 * Math.pow(4, 1.5)) // 616
  })

  test('levelFromXp est l’inverse cohérent de xpForLevel', () => {
    expect(levelFromXp(77)).toBe(2)
    expect(levelFromXp(76)).toBe(1)
    expect(levelFromXp(616)).toBe(5)
  })

  test('niveau global = niveau de la moyenne des six stats', () => {
    // Six stats à 616 → moyenne 616 → niveau 5.
    expect(globalLevelFromStats([616, 616, 616, 616, 616, 616])).toBe(5)
    // Une seule stat spécialisée : moyenne tirée vers le bas.
    expect(globalLevelFromStats([3696, 0, 0, 0, 0, 0])).toBe(5) // 3696/6 = 616
  })

  test('levelProgress reste borné entre 0 et 1', () => {
    const p = levelProgress(150)
    expect(p).toBeGreaterThanOrEqual(0)
    expect(p).toBeLessThan(1)
    expect(levelProgress(0)).toBe(0)
  })
})
