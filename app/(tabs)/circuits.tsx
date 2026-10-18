import { useQuery } from 'convex/react'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { api } from '@convex/_generated/api'
import type { Doc } from '@convex/_generated/dataModel'
import { Screen } from '@/components/Screen'
import { Txt } from '@/components/Txt'
import { Colors, Radius, Spacing } from '@/constants/theme'
import { formatCircuitDate } from '@/utils/circuits.utils'

type EnrichedCircuit = { circuit: Doc<'circuits'>; record: Doc<'circuitSessions'> | null }

export default function CircuitsScreen() {
  const router = useRouter()
  const circuits = useQuery(api.circuits.listActiveCircuits)
  const all = useMemo(() => circuits ?? [], [circuits])

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Txt variant="h1">Circuits</Txt>
          <Pressable
            onPress={() => router.push('/circuit/new')}
            accessibilityRole="button"
            style={styles.newBtn}
          >
            <Txt variant="h3" color={Colors.onPrimary}>
              + Nouveau circuit
            </Txt>
          </Pressable>
        </View>

        {circuits === undefined ? null : all.length === 0 ? (
          <Txt variant="body" color={Colors.textSecondary}>
            Aucun circuit. Crée ton premier avec « + Nouveau circuit ».
          </Txt>
        ) : (
          <View style={styles.cards}>
            {all.map((entry) => (
              <CircuitCard
                key={entry.circuit._id}
                entry={entry}
                onPress={() =>
                  router.push({ pathname: '/circuit/[id]', params: { id: entry.circuit._id } })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  )
}

function CircuitCard({ entry, onPress }: { entry: EnrichedCircuit; onPress: () => void }) {
  const { circuit, record } = entry
  const exCount = circuit.exercises.length
  return (
    <Pressable onPress={onPress} style={styles.card} accessibilityRole="button">
      <View style={styles.cardTop}>
        <Txt variant="h3" color={Colors.textPrimary}>
          {circuit.name}
        </Txt>
        <Txt variant="caption" color={Colors.textMuted}>
          {exCount} exercice{exCount > 1 ? 's' : ''}
        </Txt>
      </View>

      <View style={styles.cardBottom}>
        <View style={styles.recordCol}>
          <Txt variant="caption" color={Colors.textMuted}>
            RECORD
          </Txt>
          {record ? (
            <Txt variant="h2" color={Colors.primary}>
              {record.totalReps} <Txt variant="body" color={Colors.textSecondary}>reps</Txt>
            </Txt>
          ) : (
            <Txt variant="body" color={Colors.textMuted}>
              —
            </Txt>
          )}
        </View>
        <View style={styles.lastCol}>
          <Txt variant="caption" color={Colors.textMuted}>
            DERNIÈRE SÉANCE
          </Txt>
          <Txt variant="body" color={Colors.textSecondary}>
            {circuit.lastSessionAt ? formatCircuitDate(circuit.lastSessionAt) : 'Jamais'}
          </Txt>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: Spacing.lg,
    gap: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  newBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  cards: {
    gap: Spacing.md,
  },
  card: {
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTop: {
    gap: Spacing.xxs,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  recordCol: {
    gap: Spacing.xxs,
  },
  lastCol: {
    gap: Spacing.xxs,
    alignItems: 'flex-end',
  },
})
