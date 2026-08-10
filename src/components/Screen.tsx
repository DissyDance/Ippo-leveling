import type { ReactNode } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Layout } from '@/constants/theme'

type Props = {
  children: ReactNode
  /** Centre le contenu verticalement (écrans d'auth / onboarding). */
  centered?: boolean
  style?: ViewStyle
}

/** Conteneur d'écran : fond dark, safe area, padding et largeur max (web). */
export function Screen({ children, centered = false, style }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.content, centered && styles.centered, style]}>{children}</View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Layout.screenPadding,
  },
  centered: {
    justifyContent: 'center',
  },
})
