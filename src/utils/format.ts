import { FIELD_CONFIG, type FieldKey } from '@/constants/theme'

type Values = Partial<Record<FieldKey, number>>

/** Nombre propre : retire les décimales inutiles (12.0 → 12, 9.80 → 9.8). */
export const formatNumber = (n: number): string => {
  if (Number.isInteger(n)) return String(n)
  return String(Number.parseFloat(n.toFixed(2)))
}

/** Une mesure avec son unité : « 15 rep », « 9.8 s ». */
export const formatField = (field: FieldKey, value: number): string =>
  `${formatNumber(value)} ${FIELD_CONFIG[field].unit}`

/**
 * Résumé d'un record : la métrique principale d'abord, puis les conditions
 * (autres champs renseignés), jamais comparées. Ex. « 15 rep · 20 kg ».
 */
export const formatConditions = (
  values: Values,
  enabledFields: readonly FieldKey[],
  primaryMetric: FieldKey,
): string => {
  return enabledFields
    .filter((f) => f !== primaryMetric && values[f] !== undefined)
    .map((f) => formatField(f, values[f] as number))
    .join(' · ')
}
