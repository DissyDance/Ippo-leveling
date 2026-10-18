import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { TextField } from '@/components/TextField'
import { Txt } from '@/components/Txt'
import { Colors, Layout, Radius, Spacing } from '@/constants/theme'
import { useResponsive } from '@/hooks/useResponsive'
import type { CircuitExercise } from '@/utils/circuits.utils'

export type CircuitFormValues = {
  name: string
  description: string | null
  exercises: CircuitExercise[]
}

type Props = {
  /** Valeurs initiales (édition). Absent = nouveau circuit. */
  initial?: CircuitFormValues
  submitLabel: string
  onSubmit: (values: CircuitFormValues) => Promise<void>
  /** Bouton « Supprimer » sous le formulaire (édition seulement). */
  onDelete?: () => void
  deleting?: boolean
}

/** Ligne d'exercice en cours de saisie — valeurs texte, parsées au submit. */
type Row = { name: string; repsStr: string; loadStr: string }

const toRow = (e: CircuitExercise): Row => ({
  name: e.name,
  repsStr: String(e.reps),
  loadStr: e.load > 0 ? String(e.load) : '',
})

const EMPTY_ROW: Row = { name: '', repsStr: '', loadStr: '' }

const parseNum = (raw: string): number | null => {
  const t = raw.trim()
  if (t === '') return null
  if (!/^\d+([.,]\d+)?$/.test(t)) return null
  const n = Number.parseFloat(t.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/**
 * Formulaire de circuit : nom, description, et liste ordonnée d'exercices
 * (nom + répétitions + poids). Partagé entre création (circuit/new) et édition
 * (circuit/[id]/edit). Les exercices sont autonomes : aucun lien vers Records.
 */
export function CircuitForm({ initial, submitLabel, onSubmit, onDelete, deleting = false }: Props) {
  const { isWide } = useResponsive()
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [rows, setRows] = useState<Row[]>(
    initial && initial.exercises.length > 0 ? initial.exercises.map(toRow) : [EMPTY_ROW],
  )
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const setRow = (index: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  const addRow = () => setRows((prev) => [...prev, { ...EMPTY_ROW }])
  const removeRow = (index: number) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))

  // Un exercice est valide : nom renseigné + reps parsable ≥ 0 + poids vide ou parsable.
  const parsed: CircuitExercise[] = []
  let allValid = true
  for (const r of rows) {
    const reps = parseNum(r.repsStr)
    const load = r.loadStr.trim() === '' ? 0 : parseNum(r.loadStr)
    if (r.name.trim().length < 1 || reps === null || load === null) {
      allValid = false
    } else {
      parsed.push({ name: r.name.trim(), reps, load })
    }
  }
  const valid = name.trim().length > 0 && rows.length >= 1 && allValid

  const submit = async () => {
    if (!valid) return
    setSaving(true)
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
        exercises: parsed,
      })
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
      <TextField
        label="Nom"
        value={name}
        onChangeText={setName}
        placeholder="Circuit abdos, HIIT matin…"
        autoCapitalize="sentences"
      />
      <TextField
        label="Description (optionnel)"
        value={description}
        onChangeText={setDescription}
        placeholder="Consignes, repos entre exercices…"
        autoCapitalize="sentences"
      />

      <View style={styles.section}>
        <Txt variant="label" color={Colors.textSecondary}>
          EXERCICES (DANS L’ORDRE)
        </Txt>
        {rows.map((row, index) => (
          <View key={index} style={styles.row}>
            <View style={styles.rowHeader}>
              <Txt variant="caption" color={Colors.textMuted}>
                EXERCICE {index + 1}
              </Txt>
              <Pressable
                onPress={() => removeRow(index)}
                disabled={rows.length <= 1}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Retirer l’exercice ${index + 1}`}
                style={styles.removeBtn}
              >
                <Icon
                  name="close"
                  size={18}
                  color={rows.length <= 1 ? Colors.textDisabled : Colors.textSecondary}
                />
              </Pressable>
            </View>
            <TextField
              label="Nom"
              value={row.name}
              onChangeText={(v) => setRow(index, { name: v })}
              placeholder="Pompes, Squats…"
              autoCapitalize="sentences"
            />
            <View style={styles.numRow}>
              <View style={styles.numField}>
                <TextField
                  label="Répétitions"
                  value={row.repsStr}
                  onChangeText={(v) => setRow(index, { repsStr: v })}
                  placeholder="20"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.numField}>
                <TextField
                  label="Poids (kg) — optionnel"
                  value={row.loadStr}
                  onChangeText={(v) => setRow(index, { loadStr: v })}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        ))}

        <Pressable onPress={addRow} style={styles.addBtn} accessibilityRole="button">
          <Txt variant="h3" color={Colors.primary}>
            + Ajouter un exercice
          </Txt>
        </Pressable>
      </View>

      <Button label={submitLabel} onPress={submit} loading={saving} disabled={!valid} />

      {/* Suppression avec confirmation en ligne — même pattern que RunForm. */}
      {onDelete ? (
        <View style={styles.dangerZone}>
          {confirmingDelete ? (
            <View style={styles.confirmBox}>
              <Txt variant="body" color={Colors.textPrimary}>
                Supprimer ce circuit ? Son historique de séances sera effacé.
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
              accessibilityLabel="Supprimer le circuit"
            >
              <Txt variant="h3" color={Colors.danger}>
                Supprimer le circuit
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
  section: {
    gap: Spacing.sm,
  },
  row: {
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  removeBtn: {
    padding: Spacing.xxs,
    borderRadius: Radius.pill,
  },
  numRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  numField: {
    flex: 1,
  },
  addBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderStyle: 'dashed',
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
