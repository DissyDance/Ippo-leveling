import type { ReactNode } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Layout } from '@/constants/theme'
import { useResponsive } from '@/hooks/useResponsive'

type Props = {
  children: ReactNode
  /** Centre le contenu verticalement (écrans d'auth / onboarding). */
  centered?: boolean
  style?: ViewStyle
}

/**
 * Conteneur d'écran : fond dark, safe area, padding responsive.
 * Téléphone : contenu borné (560) et centré. Ordinateur : pleine page.
 */
export function Screen({ children, centered = false, style }: Props) {
  const { isWide } = useResponsive()
  return (
    <SafeAreaView style={styles.safe}>
      <View
        style={[
          styles.content,
          isWide ? styles.contentWide : styles.contentNarrow,
          centered && styles.centered,
          style,
        ]}
      >
        {children}
      </View>
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
    alignSelf: 'center',
  },
  contentNarrow: {
    maxWidth: Layout.maxContentWidth,
    paddingHorizontal: Layout.screenPadding,
  },
  contentWide: {
    paddingHorizontal: Layout.screenPaddingWide,
  },
  centered: {
    justifyContent: 'center',
  },
})
