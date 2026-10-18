import { useQuery } from 'convex/react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { api } from '@convex/_generated/api'
import type { Doc, Id } from '@convex/_generated/dataModel'
import { Button } from '@/components/Button'
import { Txt } from '@/components/Txt'
import { Colors, Layout, Radius, Spacing } from '@/constants/theme'
import { useResponsive } from '@/hooks/useResponsive'
import { formatCircuitDate, formatExercise } from '@/utils/circuits.utils'

export default function CircuitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const circuitId = id as Id<'circuits'>
  const router = useRouter()
  const { isWide } = useResponsive()
  const data = useQuery(api.circuits.getCircuit, { circuitId })
  const sessions = useQuery(api.circuits.listSessions, { circuitId })

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

  const { circuit, record } = data

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, isWide ? styles.contentWide : styles.contentNarrow]}
    >
      <View style={styles.header}>
        <Txt variant="h1">{circuit.name}</Txt>
        {circuit.description ? (
          <Txt variant="body" color={Colors.textSecondary}>
            {circuit.description}
          </Txt>
        ) : null}
        <Txt variant="caption" color={Colors.textMuted}>
          {circuit.sessionCount} séance{circuit.sessionCount > 1 ? 's' : ''} ·{' '}
          {circuit.lastSessionAt
            ? `dernière le ${formatCircuitDate(circuit.lastSessionAt)}`
            : 'aucune séance'}
        </Txt>
      </View>

      <View style={styles.actions}>
        <View style={styles.actionGrow}>
          <Button
            label="Démarrer une séance"
            onPress={() => router.push({ pathname: '/circuit/[id]/session', params: { id: circuitId } })}
          />
        </View>
        <Pressable
          onPress={() => router.push({ pathname: '/circuit/[id]/edit', params: { id: circuitId } })}
          style={styles.editBtn}
          accessibilityRole="button"
        >
          <Txt variant="h3" color={Colors.primary}>
            Modifier
          </Txt>
        </Pressable>
      </View>

      {/* Record = meilleure séance par total de répétitions, avec son détail. */}
      <View style={styles.recordCard}>
        <Txt variant="label" color={Colors.textSecondary}>
          RECORD DE RÉPÉTITIONS
        </Txt>
        {record ? (
          <>
            <Txt variant="recordValue" color={Colors.primary}>
              {record.circuitReps} <Txt variant="h3" color={Colors.textSecondary}>tours</Txt>
            </Txt>
            <Txt variant="caption" color={Colors.textMuted}>
              le {formatCircuitDate(record.performedAt)}
            </Txt>
            <View style={styles.snapshot}>
              {record.entries.map((e, i) => (
                <View key={i} style={styles.snapshotRow}>
                  <Txt variant="body" color={Colors.textPrimary}>
                    {e.name}
                  </Txt>
                  <Txt variant="data" color={Colors.primarySoft}>
                    {formatExercise(e)}
                  </Txt>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Txt variant="body" color={Colors.textMuted}>
            Pas encore de record. Enregistre une séance pour en poser un.
          </Txt>
        )}
      </View>

      {/* Plan du circuit (cibles). */}
      <View style={styles.section}>
        <Txt variant="label" color={Colors.textSecondary}>
          EXERCICES DU CIRCUIT
        </Txt>
        <View style={styles.planCol}>
          {circuit.exercises.map((e, i) => (
            <View key={i} style={styles.planRow}>
              <Txt variant="body" color={Colors.textPrimary}>
                {i + 1}. {e.name}
              </Txt>
              <Txt variant="data" color={Colors.textSecondary}>
                {formatExercise(e)}
              </Txt>
            </View>
          ))}
        </View>
      </View>

      {/* Historique des séances. */}
      <View style={styles.section}>
        <Txt variant="label" color={Colors.textSecondary}>
          HISTORIQUE
        </Txt>
        {sessions === undefined ? null : sessions.length === 0 ? (
          <Txt variant="body" color={Colors.textSecondary}>
            Aucune séance enregistrée pour ce circuit.
          </Txt>
        ) : (
          <View style={styles.historyCol}>
            {sessions.map((s) => (
              <SessionRow key={s._id} session={s} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  )
}

function SessionRow({ session }: { session: Doc<'circuitSessions'> }) {
  return (
    <View style={styles.sessionRow}>
      <View style={styles.sessionHeader}>
        <Txt variant="caption" color={Colors.textMuted}>
          {formatCircuitDate(session.performedAt)}
        </Txt>
        {session.isPersonalRecord ? (
          <View style={styles.prBadge}>
            <Txt variant="label" color={Colors.onPrimary}>
              RECORD
            </Txt>
          </View>
        ) : null}
      </View>
      <Txt variant="h3" color={Colors.primary}>
        {session.circuitReps} tour{session.circuitReps > 1 ? 's' : ''}
      </Txt>
      <Txt variant="bodySmall" color={Colors.textSecondary}>
        {session.entries.map((e) => `${e.name} ${e.reps}`).join(' · ')}
      </Txt>
      {session.notes ? (
        <Txt variant="bodySmall" color={Colors.textSecondary} style={styles.notes}>
          {session.notes}
        </Txt>
      ) : null}
    </View>
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
  header: {
    gap: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionGrow: {
    flex: 1,
  },
  editBtn: {
    minHeight: Layout.minTouchTarget,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordCard: {
    gap: Spacing.xs,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  snapshot: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  snapshotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  section: {
    gap: Spacing.sm,
  },
  planCol: {
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderNeutral,
  },
  historyCol: {
    gap: Spacing.sm,
  },
  sessionRow: {
    gap: Spacing.xxs,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  prBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
  },
  notes: {
    fontStyle: 'italic',
  },
})
