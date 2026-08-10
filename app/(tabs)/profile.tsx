import { useQuery } from 'convex/react'
import { useMemo } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { api } from '@convex/_generated/api'
import { RadarChart } from '@/components/RadarChart'
import { Screen } from '@/components/Screen'
import { StatPill } from '@/components/StatPill'
import { Txt } from '@/components/Txt'
import { Colors, Spacing, STAT_CONFIG, STATS } from '@/constants/theme'
import { globalLevelFromStats, levelFromXp } from '@/utils/xp.utils'

export default function ProfileScreen() {
  const player = useQuery(api.players.getCurrentPlayer)
  const logs = useQuery(api.players.listRecentXpLogs, { limit: 30 })
  const items = useQuery(api.items.listActiveItems)

  const statXps = useMemo(
    () => (player ? STATS.map((s) => player[STAT_CONFIG[s].xpKey]) : STATS.map(() => 0)),
    [player],
  )
  const levels = useMemo(() => statXps.map((xp) => levelFromXp(xp)), [statXps])
  const globalLevel = globalLevelFromStats(statXps)
  const totalSessions = items?.reduce((sum, e) => sum + e.item.sessionCount, 0) ?? 0

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.levelHeader}>
          <Txt variant="label" color={Colors.textSecondary}>
            NIVEAU GLOBAL
          </Txt>
          <Txt variant="hero" color={Colors.gold}>
            {globalLevel}
          </Txt>
          <Txt variant="bodySmall" color={Colors.textMuted}>
            {totalSessions} session{totalSessions > 1 ? 's' : ''} enregistrée{totalSessions > 1 ? 's' : ''}
          </Txt>
        </View>

        <View style={styles.radarWrap}>
          <RadarChart levels={levels} />
        </View>

        <View style={styles.statGrid}>
          {STATS.map((stat, i) => (
            <View key={stat} style={styles.statRow}>
              <StatPill stat={stat} showLabel />
              <Txt variant="data" color={Colors.textPrimary}>
                Nv {levels[i]}
              </Txt>
            </View>
          ))}
        </View>

        <View style={styles.history}>
          <Txt variant="label" color={Colors.textSecondary}>
            HISTORIQUE XP
          </Txt>
          {logs && logs.length > 0 ? (
            logs.map((log) => (
              <View key={log._id} style={styles.logRow}>
                <StatPill stat={log.stat} />
                <Txt variant="bodySmall" style={styles.logLabel} numberOfLines={1}>
                  {log.label}
                </Txt>
                <Txt variant="data" color={Colors.gold}>
                  +{log.amount}
                </Txt>
              </View>
            ))
          ) : (
            <Txt variant="bodySmall" color={Colors.textMuted}>
              Aucun gain pour l’instant.
            </Txt>
          )}
        </View>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: Spacing.lg,
    gap: Spacing.xl,
  },
  levelHeader: {
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  radarWrap: {
    alignItems: 'center',
  },
  statGrid: {
    gap: Spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
  },
  history: {
    gap: Spacing.sm,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderNeutral,
  },
  logLabel: {
    flex: 1,
  },
})
