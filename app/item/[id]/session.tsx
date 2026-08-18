import { useMutation, useQuery } from 'convex/react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import { Button } from '@/components/Button'
import { StatPill } from '@/components/StatPill'
import { TextField } from '@/components/TextField'
import { Txt } from '@/components/Txt'
import {
  Colors,
  FIELD_CONFIG,
  Layout,
  Radius,
  Spacing,
  type FieldKey,
  type Stat,
} from '@/constants/theme'
import { useResponsive } from '@/hooks/useResponsive'
import { formatConditions, formatField } from '@/utils/format'

type RecordResult = {
  isPersonalRecord: boolean
  xpPerStat: number
  stats: Stat[]
  consistency: { xp: number; tiers: number[] }
}

const toISODate = (ms: number): string => new Date(ms).toISOString().slice(0, 10)

/** Date du jour, calculée à l'import (une fois), pour éviter un appel impur au render. */
const TODAY_ISO = toISODate(Date.now())

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const itemId = id as Id<'items'>
  const router = useRouter()
  const { isWide } = useResponsive()
  const data = useQuery(api.items.getItem, { itemId })
  const recordSession = useMutation(api.sessions.record)

  const [inputs, setInputs] = useState<Partial<Record<FieldKey, string>>>({})
  const [dateStr, setDateStr] = useState(TODAY_ISO)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<RecordResult | null>(null)

  const item = data?.item
  const record = data?.record

  if (data === undefined) {
    return (
      <View style={styles.center}>
        <Txt variant="body" color={Colors.textSecondary}>
          Chargement…
        </Txt>
      </View>
    )
  }
  if (item === undefined || item === null) {
    return (
      <View style={styles.center}>
        <Txt variant="body" color={Colors.textSecondary}>
          Exercice introuvable.
        </Txt>
      </View>
    )
  }

  const primaryFilled = inputs[item.primaryMetric] !== undefined && inputs[item.primaryMetric] !== ''

  const submit = async () => {
    const values: Partial<Record<FieldKey, number>> = {}
    for (const field of item.enabledFields) {
      const raw = inputs[field]
      if (raw !== undefined && raw !== '') {
        const n = Number.parseFloat(raw.replace(',', '.'))
        if (Number.isFinite(n)) values[field] = n
      }
    }
    if (values[item.primaryMetric] === undefined) return

    const parsedDate = Date.parse(dateStr)
    const performedAt = Number.isFinite(parsedDate) ? parsedDate : Date.now()

    setSaving(true)
    try {
      const res = await recordSession({
        itemId,
        values,
        performedAt,
        notes: notes.trim() || undefined,
      })
      setResult({
        isPersonalRecord: res.isPersonalRecord,
        xpPerStat: res.xpPerStat,
        stats: res.stats,
        consistency: res.consistency,
      })
    } finally {
      setSaving(false)
    }
  }

  if (result) {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, isWide ? styles.contentWide : styles.contentNarrow]}
      >
        {result.isPersonalRecord ? (
          <Animated.View entering={FadeInDown.springify()} style={styles.prBanner}>
            <Txt variant="h1" color={Colors.onPrimary}>
              RECORD BATTU
            </Txt>
          </Animated.View>
        ) : (
          <Txt variant="h2">Session enregistrée</Txt>
        )}

        <View style={styles.recapCard}>
          <Txt variant="label" color={Colors.textSecondary}>
            XP GAGNÉE
          </Txt>
          <View style={styles.wrapRow}>
            {result.stats.map((stat) => (
              <View key={stat} style={styles.xpRow}>
                <StatPill stat={stat} />
                <Txt variant="data" color={Colors.primary}>
                  +{result.xpPerStat}
                </Txt>
              </View>
            ))}
          </View>
          {result.consistency.xp > 0 ? (
            <Txt variant="bodySmall" color={Colors.primarySoft}>
              Bonus de régularité : +{result.consistency.xp} Volonté
            </Txt>
          ) : null}
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
      <Txt variant="h2">{item.name}</Txt>

      {/* Rappel du record au-dessus de la métrique principale. */}
      <View style={styles.recordReminder}>
        <Txt variant="caption" color={Colors.textMuted}>
          RECORD ACTUEL · {FIELD_CONFIG[item.primaryMetric].label}
        </Txt>
        {record ? (
          <Txt variant="h3" color={Colors.primary}>
            {formatField(item.primaryMetric, record.primaryValue)}
            {formatConditions(record.values, item.enabledFields, item.primaryMetric)
              ? `  ·  ${formatConditions(record.values, item.enabledFields, item.primaryMetric)}`
              : ''}
          </Txt>
        ) : (
          <Txt variant="body" color={Colors.textMuted}>
            Pas encore de record.
          </Txt>
        )}
      </View>

      <TextField label="Date" value={dateStr} onChangeText={setDateStr} placeholder="AAAA-MM-JJ" />

      {item.enabledFields.map((field) => (
        <TextField
          key={field}
          label={`${FIELD_CONFIG[field].label} (${FIELD_CONFIG[field].unit})${field === item.primaryMetric ? ' — principale' : ''}`}
          value={inputs[field] ?? ''}
          onChangeText={(v) => setInputs((prev) => ({ ...prev, [field]: v }))}
          keyboardType="numeric"
        />
      ))}

      <TextField
        label="Notes (optionnel)"
        value={notes}
        onChangeText={setNotes}
        autoCapitalize="sentences"
      />

      <Button label="Enregistrer la session" onPress={submit} loading={saving} disabled={!primaryFilled} />
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
  recordReminder: {
    gap: Spacing.xxs,
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
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    alignItems: 'center',
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
})
