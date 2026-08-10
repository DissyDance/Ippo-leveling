import { memo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import type { Doc } from '@convex/_generated/dataModel'
import {
  Colors,
  FIELD_CONFIG,
  Layout,
  Motion,
  Radius,
  Spacing,
} from '@/constants/theme'
import { formatConditions, formatField } from '@/utils/format'
import { RankBadge } from './RankBadge'
import { StatPill } from './StatPill'
import { Txt } from './Txt'

export type ItemEntry = { item: Doc<'items'>; record: Doc<'sessions'> | null }

type Props = {
  entry: ItemEntry
  onPress: () => void
}

function ItemCardBase({ entry, onPress }: Props) {
  const { item, record } = entry
  const primaryLabel = FIELD_CONFIG[item.primaryMetric].label

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <View style={styles.header}>
        <Txt variant="h3" style={styles.name} numberOfLines={1}>
          {item.name}
        </Txt>
        <RankBadge rank={item.rank} />
      </View>

      <View style={styles.stats}>
        {item.statTargets.map((stat) => (
          <StatPill key={stat} stat={stat} />
        ))}
      </View>

      <View style={styles.recordBlock}>
        <Txt variant="caption" color={Colors.textMuted}>
          RECORD · {primaryLabel}
        </Txt>
        {record ? (
          <>
            <Txt variant="recordValue" color={Colors.gold}>
              {formatField(item.primaryMetric, record.primaryValue)}
            </Txt>
            {formatConditions(record.values, item.enabledFields, item.primaryMetric) ? (
              <Txt variant="bodySmall" color={Colors.textSecondary}>
                {formatConditions(record.values, item.enabledFields, item.primaryMetric)}
              </Txt>
            ) : null}
          </>
        ) : (
          <Txt variant="bodyLarge" color={Colors.textMuted}>
            Aucun record — enregistre ta première session
          </Txt>
        )}
      </View>

      <View style={styles.footer}>
        <Txt variant="caption" color={Colors.textMuted}>
          {item.sessionCount} session{item.sessionCount > 1 ? 's' : ''}
        </Txt>
        {item.currentTarget !== undefined ? (
          <Txt variant="caption" color={Colors.goldSoft}>
            Objectif : {formatField(item.primaryMetric, item.currentTarget)}
          </Txt>
        ) : null}
      </View>
    </Pressable>
  )
}

export const ItemCard = memo(ItemCardBase)

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Layout.cardPadding,
    gap: Spacing.md,
  },
  pressed: {
    transform: [{ scale: Motion.pressScale }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  recordBlock: {
    gap: Spacing.xxs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})
