import { StyleSheet, Text, View } from 'react-native'
import { RANK_CONFIG, Radius, Spacing, Typography, type Rank } from '@/constants/theme'

export function RankBadge({ rank }: { rank: Rank }) {
  const config = RANK_CONFIG[rank]
  return (
    <View style={[styles.badge, { backgroundColor: config.color }]}>
      <Text style={[Typography.label, styles.text, { color: config.onColor }]}>{rank}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 28,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
  },
})
