import { useMutation } from 'convex/react'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { api } from '@convex/_generated/api'
import { Button } from '@/components/Button'
import { StatPill } from '@/components/StatPill'
import { TextField } from '@/components/TextField'
import { Txt } from '@/components/Txt'
import {
  Colors,
  FIELD_CONFIG,
  FIELD_KEYS,
  RANKS,
  RANK_CONFIG,
  Radius,
  Spacing,
  STATS,
  type Direction,
  type FieldKey,
  type Rank,
  type Stat,
} from '@/constants/theme'
import { xpPerStat } from '@/utils/xp.utils'

export default function NewItem() {
  const router = useRouter()
  const createItem = useMutation(api.items.create)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [stats, setStats] = useState<Stat[]>([])
  const [rank, setRank] = useState<Rank>('C')
  const [fields, setFields] = useState<FieldKey[]>([])
  const [primary, setPrimary] = useState<FieldKey | null>(null)
  const [direction, setDirection] = useState<Direction>('higher_better')
  const [saving, setSaving] = useState(false)

  const toggleStat = (s: Stat) =>
    setStats((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))

  const toggleField = (f: FieldKey) => {
    setFields((prev) => {
      const on = prev.includes(f)
      const next = on ? prev.filter((x) => x !== f) : [...prev, f]
      // Métrique principale : défaut = premier champ activé.
      if (!on && primary === null) {
        setPrimary(f)
        setDirection(FIELD_CONFIG[f].defaultDirection)
      }
      if (on && primary === f) setPrimary(next[0] ?? null)
      return next
    })
  }

  const selectPrimary = (f: FieldKey) => {
    setPrimary(f)
    setDirection(FIELD_CONFIG[f].defaultDirection)
  }

  const valid = name.trim().length > 0 && stats.length >= 1 && fields.length >= 1 && primary !== null
  const previewXp = useMemo(
    () => (stats.length >= 1 ? xpPerStat(rank, stats.length, false) : 0),
    [rank, stats.length],
  )

  const submit = async () => {
    if (!valid || primary === null) return
    setSaving(true)
    try {
      await createItem({
        name: name.trim(),
        description: description.trim() || undefined,
        statTargets: stats,
        rank,
        enabledFields: fields,
        primaryMetric: primary,
        direction,
      })
      router.back()
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TextField label="Nom" value={name} onChangeText={setName} placeholder="Pompes, Sprint 100m…" autoCapitalize="sentences" />
      <TextField
        label="Description (optionnel)"
        value={description}
        onChangeText={setDescription}
        placeholder="Variante, consignes…"
        autoCapitalize="sentences"
      />

      <Section title="Caractéristiques ciblées">
        <View style={styles.wrapRow}>
          {STATS.map((s) => (
            <StatPill key={s} stat={s} showLabel selected={stats.includes(s)} onPress={() => toggleStat(s)} />
          ))}
        </View>
      </Section>

      <Section title="Rang">
        <View style={styles.wrapRow}>
          {RANKS.map((r) => (
            <Pressable
              key={r}
              onPress={() => setRank(r)}
              style={[
                styles.rankChip,
                { borderColor: RANK_CONFIG[r].color },
                rank === r ? { backgroundColor: RANK_CONFIG[r].color } : null,
              ]}
            >
              <Txt variant="label" color={rank === r ? RANK_CONFIG[r].onColor : RANK_CONFIG[r].color}>
                {r} · {RANK_CONFIG[r].xp}
              </Txt>
            </Pressable>
          ))}
        </View>
        {stats.length >= 1 ? (
          <Txt variant="bodySmall" color={Colors.goldSoft}>
            ≈ {previewXp} XP par caractéristique et par session (×1.5 sur un record).
          </Txt>
        ) : null}
      </Section>

      <Section title="Champs mesurés">
        <View style={styles.wrapRow}>
          {FIELD_KEYS.map((f) => (
            <Pressable
              key={f}
              onPress={() => toggleField(f)}
              style={[styles.fieldChip, fields.includes(f) ? styles.fieldChipOn : null]}
            >
              <Txt variant="body" color={fields.includes(f) ? Colors.textPrimary : Colors.textMuted}>
                {FIELD_CONFIG[f].label} ({FIELD_CONFIG[f].unit})
              </Txt>
            </Pressable>
          ))}
        </View>
      </Section>

      {fields.length >= 1 ? (
        <Section title="Métrique principale">
          <Txt variant="bodySmall" color={Colors.textSecondary}>
            C&apos;est le seul champ comparé pour battre un record. Les autres champs sont
            enregistrés comme conditions, jamais comparés.
          </Txt>
          <View style={styles.wrapRow}>
            {fields.map((f) => (
              <Pressable
                key={f}
                onPress={() => selectPrimary(f)}
                style={[styles.fieldChip, primary === f ? styles.fieldChipOn : null]}
              >
                <Txt variant="body" color={primary === f ? Colors.gold : Colors.textMuted}>
                  {FIELD_CONFIG[f].label}
                </Txt>
              </Pressable>
            ))}
          </View>

          <View style={styles.wrapRow}>
            <DirectionButton
              active={direction === 'higher_better'}
              label="Plus haut = mieux"
              onPress={() => setDirection('higher_better')}
            />
            <DirectionButton
              active={direction === 'lower_better'}
              label="Plus bas = mieux (chrono)"
              onPress={() => setDirection('lower_better')}
            />
          </View>
        </Section>
      ) : null}

      <Button label="Créer l’exercice" onPress={submit} loading={saving} disabled={!valid} />
    </ScrollView>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Txt variant="label" color={Colors.textSecondary}>
        {title.toUpperCase()}
      </Txt>
      {children}
    </View>
  )
}

function DirectionButton({
  active,
  label,
  onPress,
}: {
  active: boolean
  label: string
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress} style={[styles.fieldChip, active ? styles.fieldChipOn : null]}>
      <Txt variant="bodySmall" color={active ? Colors.gold : Colors.textMuted}>
        {label}
      </Txt>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.xl,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  section: {
    gap: Spacing.sm,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    alignItems: 'center',
  },
  rankChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  fieldChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderNeutral,
  },
  fieldChipOn: {
    borderColor: Colors.gold,
    backgroundColor: Colors.surfaceElevated,
  },
})
