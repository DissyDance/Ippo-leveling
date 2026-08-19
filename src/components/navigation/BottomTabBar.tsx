import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs/types'
import { Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Icon } from '@/components/Icon'
import { Txt } from '@/components/Txt'
import { Colors, Layout, Spacing } from '@/constants/theme'
import { TAB_ENTRIES } from './tabs.config'

/**
 * Barre de navigation mobile, inspirée de Leveling Master : icône + libellé,
 * accent violet et indicateur en losange sur l'onglet actif.
 */
export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const entry = TAB_ENTRIES.find((e) => e.name === route.name)
          if (!entry) return null
          const focused = state.index === index
          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.item}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={entry.label}
            >
              <View style={[styles.diamond, focused ? styles.diamondActive : null]} />
              <Icon
                name={entry.icon}
                size={24}
                color={focused ? Colors.primary : Colors.textMuted}
                stroke={focused ? 2 : 1.8}
              />
              <Txt variant="caption" color={focused ? Colors.primary : Colors.textMuted}>
                {entry.label}
              </Txt>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  row: {
    height: Layout.tabBarHeight,
    flexDirection: 'row',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  diamond: {
    width: 6,
    height: 6,
    marginBottom: Spacing.xxs,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
    backgroundColor: 'transparent',
  },
  diamondActive: {
    backgroundColor: Colors.primary,
  },
})
