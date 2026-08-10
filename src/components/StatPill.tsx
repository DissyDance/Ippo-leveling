import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Colors, Radius, Spacing, Typography, STAT_CONFIG, type Stat } from '@/constants/theme'

type Props = {
  stat: Stat
  /** Rendu « sélectionné » (filtres, multi-sélection de création). */
  selected?: boolean
  onPress?: () => void
  showLabel?: boolean
}

export function StatPill({ stat, selected = false, onPress, showLabel = false }: Props) {
  const config = STAT_CONFIG[stat]
  const content = (
    <View
      style={[
        styles.pill,
        { borderColor: config.color },
        selected ? { backgroundColor: config.color } : null,
      ]}
    >
      <Text
        style={[Typography.label, { color: selected ? Colors.background : config.color }]}
      >
        {showLabel ? config.label : stat}
      </Text>
    </View>
  )
  if (!onPress) return content
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {content}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
})
