import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Button } from '@/components/Button'
import { TextField } from '@/components/TextField'
import { Txt } from '@/components/Txt'
import { Colors, Layout, Radius, Spacing } from '@/constants/theme'
import { useResponsive } from '@/hooks/useResponsive'
import {
  formatPace,
  formatSpeed,
  metersToKm,
  parseDistanceKm,
  parseDuration,
} from '@/utils/running.utils'

export type RunFormValues = {
  performedAt: number
  distanceMeters: number
  durationSeconds: number
}

type Props = {
  /** Valeurs initiales (édition). Absent = nouvelle course, date du jour. */
  initial?: RunFormValues
  submitLabel: string
  onSubmit: (values: RunFormValues) => Promise<void>
  /** Rendu d'un bouton « Supprimer » sous le formulaire (édition seulement). */
  onDelete?: () => void
  deleting?: boolean
}

const toISODate = (ms: number): string => new Date(ms).toISOString().slice(0, 10)
const TODAY_ISO = toISODate(Date.now())

const hms = (totalSeconds: number): string => {
  const s = Math.round(totalSeconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(sec)}`
}

/**
 * Formulaire de saisie d'une course : date, distance (km), temps (hh:mm:ss).
 * La vitesse moyenne et l'allure s'affichent en direct, jamais saisies.
 * Partagé entre création (run/new) et édition (run/[id]/edit).
 */
export function RunForm({ initial, submitLabel, onSubmit, onDelete, deleting = false }: Props) {
  const { isWide } = useResponsive()
  const [dateStr, setDateStr] = useState(initial ? toISODate(initial.performedAt) : TODAY_ISO)
  const [distanceStr, setDistanceStr] = useState(
    initial ? metersToKm(initial.distanceMeters).toString() : '',
  )
  const [timeStr, setTimeStr] = useState(initial ? hms(initial.durationSeconds) : '')
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const distanceMeters = parseDistanceKm(distanceStr)
  const durationSeconds = parseDuration(timeStr)
  const valid = distanceMeters !== null && durationSeconds !== null

  const preview = useMemo(() => {
    if (distanceMeters === null || durationSeconds === null) return null
    return {
      speed: formatSpeed(distanceMeters, durationSeconds),
      pace: formatPace(distanceMeters, durationSeconds),
    }
  }, [distanceMeters, durationSeconds])

  const submit = async () => {
    if (distanceMeters === null || durationSeconds === null) return
    const parsedDate = Date.parse(dateStr)
    const performedAt = Number.isFinite(parsedDate) ? parsedDate : Date.now()
    setSaving(true)
    try {
      await onSubmit({ performedAt, distanceMeters, durationSeconds })
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, isWide ? styles.contentWide : styles.contentNarrow]}
      keyboardShouldPersistTaps="handled"
    >
      <TextField label="Date" value={dateStr} onChangeText={setDateStr} placeholder="AAAA-MM-JJ" />

      <TextField
        label="Distance (km)"
        value={distanceStr}
        onChangeText={setDistanceStr}
        placeholder="8.5"
        keyboardType="numeric"
      />

      <TextField
        label="Temps (hh:mm:ss)"
        value={timeStr}
        onChangeText={setTimeStr}
        placeholder="00:45:30"
        keyboardType="numbers-and-punctuation"
      />

      <View style={styles.preview}>
        <Txt variant="label" color={Colors.textSecondary}>
          VITESSE MOYENNE
        </Txt>
        {preview ? (
          <Txt variant="h2" color={Colors.primary}>
            {preview.speed}
            {'  ·  '}
            <Txt variant="body" color={Colors.textSecondary}>
              {preview.pace}
            </Txt>
          </Txt>
        ) : (
          <Txt variant="body" color={Colors.textMuted}>
            Renseigne distance et temps.
          </Txt>
        )}
      </View>

      <Button label={submitLabel} onPress={submit} loading={saving} disabled={!valid} />

      {/* Suppression avec confirmation en ligne — Alert.alert n'a pas de
          multi-bouton fiable sur web. Même pattern que l'édition d'exercice. */}
      {onDelete ? (
        <View style={styles.dangerZone}>
          {confirmingDelete ? (
            <View style={styles.confirmBox}>
              <Txt variant="body" color={Colors.textPrimary}>
                Supprimer cette course ? Elle disparaîtra de tes stats et records.
              </Txt>
              <View style={styles.confirmRow}>
                <Pressable
                  onPress={() => setConfirmingDelete(false)}
                  disabled={deleting}
                  style={[styles.dangerBtn, styles.cancelBtn]}
                  accessibilityRole="button"
                  accessibilityLabel="Annuler la suppression"
                >
                  <Txt variant="h3" color={Colors.textPrimary}>
                    Annuler
                  </Txt>
                </Pressable>
                <Pressable
                  onPress={onDelete}
                  disabled={deleting}
                  style={[styles.dangerBtn, styles.confirmDeleteBtn, deleting ? styles.btnDisabled : null]}
                  accessibilityRole="button"
                  accessibilityLabel="Confirmer la suppression"
                >
                  <Txt variant="h3" color={Colors.onCrimson}>
                    {deleting ? 'Suppression…' : 'Supprimer'}
                  </Txt>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setConfirmingDelete(true)}
              style={[styles.dangerBtn, styles.deleteBtn]}
              accessibilityRole="button"
              accessibilityLabel="Supprimer la course"
            >
              <Txt variant="h3" color={Colors.danger}>
                Supprimer la course
              </Txt>
            </Pressable>
          )}
        </View>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    width: '100%',
    alignSelf: 'center',
  },
  contentNarrow: {
    maxWidth: Layout.maxContentWidth,
  },
  contentWide: {
    paddingHorizontal: Layout.screenPaddingWide,
  },
  preview: {
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dangerZone: {
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.lg,
  },
  confirmBox: {
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.dangerBg,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  confirmRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dangerBtn: {
    minHeight: Layout.minTouchTarget,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  confirmDeleteBtn: {
    flex: 1,
    backgroundColor: Colors.danger,
  },
  btnDisabled: {
    opacity: 0.5,
  },
})
