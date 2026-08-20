import { useMutation, useQuery } from 'convex/react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { api } from '@convex/_generated/api'
import type { Doc, Id } from '@convex/_generated/dataModel'
import { Button } from '@/components/Button'
import { StatPill } from '@/components/StatPill'
import { TextField } from '@/components/TextField'
import { Txt } from '@/components/Txt'
import {
  Colors,
  FIELD_CONFIG,
  FIELD_KEYS,
  Layout,
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
import { useResponsive } from '@/hooks/useResponsive'
import { xpPerStat } from '@/utils/xp.utils'

export default function EditItem() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const itemId = id as Id<'items'>
  const router = useRouter()
  const data = useQuery(api.items.getItem, { itemId })
  const updateItem = useMutation(api.items.update)
  const item = data?.item

  if (data === undefined) {
    return (
      <View style={styles.center}>
        <Txt variant="body" color={Colors.textSecondary}>
          Chargement…
        </Txt>
      </View>
    )
  }
  if (!item) {
    return (
      <View style={styles.center}>
        <Txt variant="body" color={Colors.textSecondary}>
          Exercice introuvable.
        </Txt>
      </View>
    )
  }

  return <EditForm itemId={itemId} item={item} updateItem={updateItem} onDone={() => router.back()} />
}

type EditFormProps = {
  itemId: Id<'items'>
  item: Doc<'items'>
  updateItem: ReturnType<typeof useMutation<typeof api.items.update>>
  onDone: () => void
}

function EditForm({ itemId, item, updateItem, onDone }: EditFormProps) {
  const { isWide } = useResponsive()
  const archiveItem = useMutation(api.items.archive)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [name, setName] = useState(item.name)
  const [description, setDescription] = useState(item.description ?? '')
  const [stats, setStats] = useState<Stat[]>(item.statTargets)
  const [rank, setRank] = useState<Rank>(item.rank)
  const [fields, setFields] = useState<FieldKey[]>(item.enabledFields)
  const [primary, setPrimary] = useState<FieldKey | null>(item.primaryMetric)
  const [direction, setDirection] = useState<Direction>(item.direction)
  const [target, setTarget] = useState(
    item.currentTarget !== undefined ? String(item.currentTarget) : '',
  )
  const [saving, setSaving] = useState(false)

  const toggleStat = (s: Stat) =>
    setStats((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))

  const toggleField = (f: FieldKey) => {
    setFields((prev) => {
      const on = prev.includes(f)
      const next = on ? prev.filter((x) => x !== f) : [...prev, f]
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

  const remove = async () => {
    setDeleting(true)
    try {
      await archiveItem({ itemId })
      onDone()
    } finally {
      setDeleting(false)
    }
  }

  const submit = async () => {
    if (!valid || primary === null) return
    const parsedTarget = Number.parseFloat(target.replace(',', '.'))
    setSaving(true)
    try {
      await updateItem({
        itemId,
        name: name.trim(),
        description: description.trim() || undefined,
        statTargets: stats,
        rank,
        enabledFields: fields,
        primaryMetric: primary,
        direction,
        currentTarget: Number.isFinite(parsedTarget) ? parsedTarget : undefined,
      })
      onDone()
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
          <Txt variant="bodySmall" color={Colors.primarySoft}>
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
                <Txt variant="body" color={primary === f ? Colors.primary : Colors.textMuted}>
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

          {primary ? (
            <TextField
              label={`Objectif à atteindre (${FIELD_CONFIG[primary].unit})`}
              value={target}
              onChangeText={setTarget}
              placeholder="Optionnel"
              keyboardType="numeric"
            />
          ) : null}
        </Section>
      ) : null}

      <Button label="Enregistrer" onPress={submit} loading={saving} disabled={!valid} />

      {/* Zone dangereuse : suppression (archivage) avec confirmation joueur.
          Confirmation en ligne — Alert.alert n'a pas de multi-bouton fiable sur web. */}
      <View style={styles.dangerZone}>
        {confirmingDelete ? (
          <View style={styles.confirmBox}>
            <Txt variant="body" color={Colors.textPrimary}>
              Supprimer « {item.name} » ? Il disparaîtra de tes records et son
              historique de sessions sera effacé. Ton XP déjà gagnée reste
              conservée.
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
                onPress={remove}
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
            accessibilityLabel="Supprimer l'exercice"
          >
            <Txt variant="h3" color={Colors.danger}>
              Supprimer l&apos;exercice
            </Txt>
          </Pressable>
        )}
      </View>
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
      <Txt variant="bodySmall" color={active ? Colors.primary : Colors.textMuted}>
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
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceElevated,
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
