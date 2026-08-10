import { StyleSheet, View } from 'react-native'
import { Screen } from '@/components/Screen'
import { Txt } from '@/components/Txt'
import { Colors, Spacing } from '@/constants/theme'

// L0 : écran vide. Radar + niveau global arrivent en L1.
export default function ProfileScreen() {
  return (
    <Screen>
      <View style={styles.empty}>
        <Txt variant="h2">Profil</Txt>
        <Txt variant="body" color={Colors.textSecondary}>
          Radar et niveau global. (L1)
        </Txt>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.sm,
  },
})
