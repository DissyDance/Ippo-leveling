import {
  computeRecords,
  filterByPeriod,
  formatDuration,
  formatPace,
  metersToKm,
  parseDistanceKm,
  parseDuration,
  periodStart,
  speedKmh,
  summarize,
  type RunLike,
} from './running.utils'

describe('parseDuration — saisie hh:mm:ss', () => {
  test('hh:mm:ss', () => {
    expect(parseDuration('00:45:30')).toBe(45 * 60 + 30)
    expect(parseDuration('1:05:00')).toBe(3900)
  })
  test('mm:ss', () => {
    expect(parseDuration('45:30')).toBe(2730)
  })
  test('nombre seul = minutes', () => {
    expect(parseDuration('30')).toBe(1800)
    expect(parseDuration('7,5')).toBe(450)
  })
  test('invalide → null', () => {
    expect(parseDuration('')).toBeNull()
    expect(parseDuration('abc')).toBeNull()
    expect(parseDuration('00:00:00')).toBeNull() // temps nul rejeté
    expect(parseDuration('1:2:3:4')).toBeNull()
  })
})

describe('formatDuration', () => {
  test('< 1 h → m:ss', () => {
    expect(formatDuration(2730)).toBe('45:30')
    expect(formatDuration(65)).toBe('1:05')
  })
  test('≥ 1 h → h:mm:ss', () => {
    expect(formatDuration(3900)).toBe('1:05:00')
  })
})

describe('parseDistanceKm', () => {
  test('km → mètres', () => {
    expect(parseDistanceKm('8.5')).toBe(8500)
    expect(parseDistanceKm('10')).toBe(10000)
    expect(parseDistanceKm('5,25')).toBe(5250)
  })
  test('invalide / nul → null', () => {
    expect(parseDistanceKm('0')).toBeNull()
    expect(parseDistanceKm('')).toBeNull()
    expect(parseDistanceKm('x')).toBeNull()
  })
})

describe('vitesse & allure', () => {
  test('speedKmh : 10 km en 1 h = 10 km/h', () => {
    expect(speedKmh(10000, 3600)).toBeCloseTo(10)
  })
  test('speedKmh : temps nul → 0', () => {
    expect(speedKmh(10000, 0)).toBe(0)
  })
  test('formatPace : 10 km en 50 min = 5:00 /km', () => {
    expect(formatPace(10000, 3000)).toBe('5:00 /km')
  })
  test('metersToKm arrondit', () => {
    expect(metersToKm(8500, 1)).toBe(8.5)
    expect(metersToKm(5250)).toBe(5.25)
  })
})

describe('periodStart / filterByPeriod', () => {
  // Référence fixe : mercredi 20 août 2026, 10 h locale.
  const now = new Date(2026, 7, 20, 10, 0, 0).getTime()

  test('semaine commence le lundi', () => {
    const start = new Date(periodStart('week', now))
    expect(start.getDay()).toBe(1) // lundi
    expect(start.getDate()).toBe(17)
  })
  test('mois commence le 1er', () => {
    const start = new Date(periodStart('month', now))
    expect(start.getMonth()).toBe(7)
    expect(start.getDate()).toBe(1)
  })
  test('semestre : août → 1er juillet', () => {
    const start = new Date(periodStart('semester', now))
    expect(start.getMonth()).toBe(6)
    expect(start.getDate()).toBe(1)
  })
  test('année commence le 1er janvier', () => {
    const start = new Date(periodStart('year', now))
    expect(start.getMonth()).toBe(0)
    expect(start.getDate()).toBe(1)
  })
  test('all → 0', () => {
    expect(periodStart('all', now)).toBe(0)
  })

  test('filterByPeriod ne garde que les courses dans la fenêtre', () => {
    const runs: RunLike[] = [
      { distanceMeters: 5000, durationSeconds: 1500, performedAt: new Date(2026, 7, 19).getTime() }, // ce mois
      { distanceMeters: 5000, durationSeconds: 1500, performedAt: new Date(2026, 6, 10).getTime() }, // mois passé
    ]
    expect(filterByPeriod(runs, 'month', now)).toHaveLength(1)
    expect(filterByPeriod(runs, 'all', now)).toHaveLength(2)
  })
})

describe('summarize', () => {
  test('cumule distance, temps et vitesse moyenne globale', () => {
    const runs: RunLike[] = [
      { distanceMeters: 5000, durationSeconds: 1800, performedAt: 1 },
      { distanceMeters: 5000, durationSeconds: 1800, performedAt: 2 },
    ]
    const s = summarize(runs)
    expect(s.totalDistanceMeters).toBe(10000)
    expect(s.totalDurationSeconds).toBe(3600)
    expect(s.count).toBe(2)
    expect(s.avgSpeedKmh).toBeCloseTo(10)
  })
})

describe('computeRecords', () => {
  const runs: RunLike[] = [
    { distanceMeters: 5000, durationSeconds: 1500, performedAt: 1 }, // 12 km/h
    { distanceMeters: 12000, durationSeconds: 3600, performedAt: 2 }, // 12 km, 12 km/h
    { distanceMeters: 3000, durationSeconds: 720, performedAt: 3 }, // 15 km/h (le + rapide)
  ]

  test('plus longue distance', () => {
    expect(computeRecords(runs).longestDistance?.distanceMeters).toBe(12000)
  })
  test('meilleure vitesse', () => {
    expect(computeRecords(runs).fastestSpeed?.performedAt).toBe(3)
  })
  test('plus longue durée', () => {
    expect(computeRecords(runs).longestDuration?.durationSeconds).toBe(3600)
  })
  test('5 km équivalent : ignore les courses < 5 km', () => {
    const r = computeRecords(runs).best5k
    // meilleure allure ≥ 5 km : la course 5 km en 1500 s = 25:00 pile.
    expect(r?.seconds).toBe(1500)
  })
  test('10 km équivalent : projette la course de 12 km', () => {
    const r = computeRecords(runs).best10k
    expect(r?.seconds).toBeCloseTo(3600 * (10000 / 12000))
  })
  test('liste vide → tout à null', () => {
    const r = computeRecords([])
    expect(r.longestDistance).toBeNull()
    expect(r.best5k).toBeNull()
  })
})
