import { useMutation, useQuery } from 'convex/react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { api } from '@convex/_generated/api'
import type { Doc, Id } from '@convex/_generated/dataModel'
import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { TextField } from '@/components/TextField'
import { Txt } from '@/components/Txt'
import { Colors, Layout, Radius, Spacing } from '@/constants/theme'
import { useResponsive } from '@/hooks/useResponsive'
import { formatExercise } from '@/utils/circuits.utils'

type Row = { repsStr: string; loadStr: string }
type Result = { isPersonalRecord: boolean; totalReps: number }

const toISODate = (ms: number): string => new Date(ms).toISOString().slice(0, 10)
const TODAY_ISO = toISODate(Date.now())

const parseNum = (raw: string): number | null => {
  const t = raw.trim()
  if (t === '') return null
  if (!/^\d+([.,]\d+)?$/.test(t)) return null
  const n = Number.parseFloat(t.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

export default function CircuitSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const circuitId = id as Id<'circuits'>
  const router = useRouter()
  const data = useQuery(api.circuits.getCircuit, { circuitId })

  const close = () => {
    if (router.canGoBack()) router.back()
    else router.replace('/circuits')
  }

  useEffect(() => {
    if (Platform.OS !== 'web') return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (data === undefined) {
    return (
      <View style={styles.center}>
        <Txt variant="body" color={Colors.textSecondary}>
          Chargement…
        </Txt>
      </View>
    )
  }
  if (data === null) {
    return (
      <View style={styles.center}>
        <Txt variant="body" color={Colors.textSecondary}>
          Circuit introuvable.
        </Txt>
      </View>
    )
  }

  return <SessionForm circuit={data.circuit} circuitId={circuitId} onClose={close} />
}

/**
 * Formulaire de séance. Monté une fois le circuit chargé : `rows` est initialisé
 * depuis le plan (reps + poids cibles) via l'initialiseur de `useState`, sans
 * effet — évite tout setState synchrone dans un useEffect.
 */
function SessionForm({
  circuit,
  circuitId,
  onClose,
}: {
  circuit: Doc<'circuits'>
  circuitId: Id<'circuits'>
  onClose: () => void
}) {
  const router = useRouter()
  const { isWide } = useResponsive()
  const recordSession = useMutation(api.circuits.recordSession)

  const [rows, setRows] = useState<Row[]>(() =>
    circuit.exercises.map((e) => ({
      repsStr: String(e.reps),
      loadStr: e.load > 0 ? String(e.load) : '',
    })),
  )
  const [dateStr, setDateStr] = useState(TODAY_ISO)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  const setRow = (index: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))

  const parsedReps = rows.map((r) => parseNum(r.repsStr))
  const allRepsValid = parsedReps.every((n) => n !== null)
  const liveTotal = parsedReps.reduce<number>((acc, n) => acc + (n ?? 0), 0)

  const submit = async () => {
    if (!allRepsValid) return
    const entries = circuit.exercises.map((e, i) => {
      const row = rows[i] ?? { repsStr: '', loadStr: '' }
      const reps = parseNum(row.repsStr) ?? 0
      const load = row.loadStr.trim() === '' ? 0 : (parseNum(row.loadStr) ?? 0)
      return { name: e.name, reps, load }
    })
    const parsedDate = Date.parse(dateStr)
    const performedAt = Number.isFinite(parsedDate) ? parsedDate : Date.now()

    setSaving(true)
    try {
      const res = await recordSession({
        circuitId,
        entries,
        performedAt,
        notes: notes.trim() || undefined,
      })
      setResult({ isPersonalRecord: res.isPersonalRecord, totalReps: res.totalReps })
    } finally {
      setSaving(false)
    }
  }

  const closeX = (
    <Pressable
      onPress={onClose}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Fermer"
      style={styles.closeBtn}
    >
      <Icon name="close" size={24} color={Colors.textSecondary} />
    </Pressable>
  )

  if (result) {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, isWide ? styles.contentWide : styles.contentNarrow]}
      >
        <View style={styles.topBar}>
          <View style={styles.topBarSpacer} />
          {closeX}
        </View>
        {result.isPersonalRecord ? (
          <Animated.View entering={FadeInDown.springify()} style={styles.prBanner}>
            <Txt variant="h1" color={Colors.onPrimary}>
              RECORD BATTU
            </Txt>
          </Animated.View>
        ) : (
          <Txt variant="h2">Séance enregistrée</Txt>
        )}

        <View style={styles.recapCard}>
          <Txt variant="label" color={Colors.textSecondary}>
            TOTAL DE RÉPÉTITIONS
          </Txt>
          <Txt variant="recordValue" color={Colors.primary}>
            {result.totalReps}
          </Txt>
        </View>

        <Button label="Terminé" onPress={() => router.back()} />
      </ScrollView>
    )
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, isWide ? styles.contentWide : styles.contentNarrow]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topBar}>
        <Txt variant="h2" style={styles.topBarTitle}>
          {circuit.name}
        </Txt>
        {closeX}
      </View>

      <TextField label="Date" value={dateStr} onChangeText={setDateStr} placeholder="AAAA-MM-JJ" />

      {circuit.exercises.map((e, index) => (
        <View key={index} style={styles.exerciseCard}>
          <View style={styles.exerciseHeader}>
            <Txt variant="h3" color={Colors.textPrimary}>
              {index + 1}. {e.name}
            </Txt>
            <Txt variant="caption" color={Colors.textMuted}>
              CIBLE · {formatExercise(e)}
            </Txt>
          </View>
          <View style={styles.numRow}>
            <View style={styles.numField}>
              <TextField
                label="Répétitions"
                value={rows[index]?.repsStr ?? ''}
                onChangeText={(v) => setRow(index, { repsStr: v })}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.numField}>
              <TextField
                label="Poids (kg)"
                value={rows[index]?.loadStr ?? ''}
                onChangeText={(v) => setRow(index, { loadStr: v })}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>
      ))}

      <View style={styles.totalBox}>
        <Txt variant="label" color={Colors.textSecondary}>
          TOTAL DE RÉPÉTITIONS
        </Txt>
        <Txt variant="h2" color={Colors.primary}>
          {liveTotal}
        </Txt>
      </View>

      <TextField
        label="Notes (optionnel)"
        value={notes}
        onChangeText={setNotes}
        autoCapitalize="sentences"
      />

      <Button
        label="Enregistrer la séance"
        onPress={submit}
        loading={saving}
        disabled={!allRepsValid}
      />
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  topBarTitle: {
    flex: 1,
  },
  topBarSpacer: {
    flex: 1,
  },
  closeBtn: {
    padding: Spacing.xs,
    borderRadius: Radius.pill,
  },
  exerciseCard: {
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exerciseHeader: {
    gap: Spacing.xxs,
  },
  numRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  numField: {
    flex: 1,
  },
  totalBox: {
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  prBanner: {
    backgroundColor: Colors.primary,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  recapCard: {
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
})
