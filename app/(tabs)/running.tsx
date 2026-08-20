import { useQuery } from 'convex/react'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { api } from '@convex/_generated/api'
import type { Doc } from '@convex/_generated/dataModel'
import { Screen } from '@/components/Screen'
import { Txt } from '@/components/Txt'
import { Colors, Radius, Spacing } from '@/constants/theme'
import {
  computeRecords,
  filterByPeriod,
  formatDistance,
  formatDuration,
  formatPace,
  formatSpeed,
  metersToKm,
  PERIODS,
  summarize,
  type Period,
} from '@/utils/running.utils'

const dateLabel = (ms: number): string =>
  new Date(ms).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

export default function RunningScreen() {
  const router = useRouter()
  const runs = useQuery(api.running.list)
  const [period, setPeriod] = useState<Period>('month')

  const all = useMemo(() => runs ?? [], [runs])
  const total = useMemo(() => summarize(all), [all])
  const periodRuns = useMemo(() => filterByPeriod(all, period), [all, period])
  const periodStats = useMemo(() => summarize(periodRuns), [periodRuns])
  const records = useMemo(() => computeRecords(all), [all])

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Txt variant="h1">Running</Txt>
          <Pressable
            onPress={() => router.push('/run/new')}
            accessibilityRole="button"
            style={styles.newBtn}
          >
            <Txt variant="h3" color={Colors.onPrimary}>
              + Nouvelle session
            </Txt>
          </Pressable>
        </View>

        {/* Distance totale — cumul de TOUTES les sessions, tous temps confondus. */}
        <View style={styles.hero}>
          <Txt variant="label" color={Colors.textSecondary}>
            DISTANCE TOTALE
          </Txt>
          <Txt variant="recordValue" color={Colors.primary}>
            {metersToKm(total.totalDistanceMeters, 1)} km
          </Txt>
          <Txt variant="bodySmall" color={Colors.textMuted}>
            {total.count} session{total.count > 1 ? 's' : ''} · {formatDuration(total.totalDurationSeconds)} cumulé
          </Txt>
        </View>

        {/* Filtre temporel. Mensuel par défaut. */}
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <Pressable
              key={p.key}
              onPress={() => setPeriod(p.key)}
              style={[styles.periodChip, period === p.key ? styles.periodChipOn : null]}
            >
              <Txt variant="label" color={period === p.key ? Colors.primary : Colors.textMuted}>
                {p.label}
              </Txt>
            </Pressable>
          ))}
        </View>

        <View style={styles.statGrid}>
          <StatBox label="Distance" value={`${metersToKm(periodStats.totalDistanceMeters, 1)} km`} />
          <StatBox label="Sessions" value={String(periodStats.count)} />
          <StatBox label="Temps" value={formatDuration(periodStats.totalDurationSeconds)} />
          <StatBox
            label="Vitesse moy."
            value={periodStats.count > 0 ? `${periodStats.avgSpeedKmh.toFixed(1)} km/h` : '—'}
          />
        </View>

        <Txt variant="label" color={Colors.textSecondary} style={styles.sectionTitle}>
          RECORDS PERSONNELS
        </Txt>
        <View style={styles.recordCol}>
          <RecordRow
            label="Plus longue distance"
            value={records.longestDistance ? formatDistance(records.longestDistance.distanceMeters) : '—'}
            sub={records.longestDistance ? dateLabel(records.longestDistance.performedAt) : undefined}
          />
          <RecordRow
            label="Meilleure vitesse moy."
            value={
              records.fastestSpeed
                ? formatSpeed(records.fastestSpeed.distanceMeters, records.fastestSpeed.durationSeconds)
                : '—'
            }
            sub={records.fastestSpeed ? dateLabel(records.fastestSpeed.performedAt) : undefined}
          />
          <RecordRow
            label="Plus longue durée"
            value={records.longestDuration ? formatDuration(records.longestDuration.durationSeconds) : '—'}
            sub={records.longestDuration ? dateLabel(records.longestDuration.performedAt) : undefined}
          />
          <RecordRow
            label="5 km (équiv.)"
            value={records.best5k ? formatDuration(records.best5k.seconds) : '—'}
            sub={records.best5k ? dateLabel(records.best5k.run.performedAt) : undefined}
          />
          <RecordRow
            label="10 km (équiv.)"
            value={records.best10k ? formatDuration(records.best10k.seconds) : '—'}
            sub={records.best10k ? dateLabel(records.best10k.run.performedAt) : undefined}
          />
        </View>

        <Txt variant="label" color={Colors.textSecondary} style={styles.sectionTitle}>
          HISTORIQUE
        </Txt>
        {runs === undefined ? null : all.length === 0 ? (
          <Txt variant="body" color={Colors.textSecondary}>
            Aucune course. Enregistre ta première avec « + Nouvelle session ».
          </Txt>
        ) : (
          <View style={styles.historyCol}>
            {all.map((run) => (
              <RunRow key={run._id} run={run} onPress={() => router.push({ pathname: '/run/[id]/edit', params: { id: run._id } })} />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Txt variant="caption" color={Colors.textMuted}>
        {label.toUpperCase()}
      </Txt>
      <Txt variant="h2" color={Colors.textPrimary}>
        {value}
      </Txt>
    </View>
  )
}

function RecordRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={styles.recordRow}>
      <View style={styles.recordLabel}>
        <Txt variant="body" color={Colors.textSecondary}>
          {label}
        </Txt>
        {sub ? (
          <Txt variant="caption" color={Colors.textMuted}>
            {sub}
          </Txt>
        ) : null}
      </View>
      <Txt variant="h3" color={Colors.primary}>
        {value}
      </Txt>
    </View>
  )
}

function RunRow({ run, onPress }: { run: Doc<'runs'>; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.runRow} accessibilityRole="button">
      <View style={styles.runLeft}>
        <Txt variant="h3" color={Colors.textPrimary}>
          {metersToKm(run.distanceMeters, 2)} km
        </Txt>
        <Txt variant="caption" color={Colors.textMuted}>
          {dateLabel(run.performedAt)}
        </Txt>
      </View>
      <View style={styles.runRight}>
        <Txt variant="data" color={Colors.textPrimary}>
          {formatDuration(run.durationSeconds)}
        </Txt>
        <Txt variant="caption" color={Colors.textSecondary}>
          {formatSpeed(run.distanceMeters, run.durationSeconds)} · {formatPace(run.distanceMeters, run.durationSeconds)}
        </Txt>
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
  hero: {
    gap: Spacing.xs,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  periodChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderNeutral,
  },
  periodChipOn: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceElevated,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statBox: {
    flexGrow: 1,
    flexBasis: '45%',
    gap: Spacing.xxs,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    marginTop: Spacing.sm,
  },
  recordCol: {
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderNeutral,
  },
  recordLabel: {
    gap: 1,
  },
  historyCol: {
    gap: Spacing.sm,
  },
  runRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  runLeft: {
    gap: 1,
  },
  runRight: {
    alignItems: 'flex-end',
    gap: 1,
  },
})
