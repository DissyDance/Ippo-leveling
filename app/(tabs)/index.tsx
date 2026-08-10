import { StyleSheet, View } from 'react-native'
import { Screen } from '@/components/Screen'
import { Txt } from '@/components/Txt'
import { Colors, Spacing } from '@/constants/theme'

// L0 : écran vide. La liste des records (FlashList) arrive en L1.
export default function RecordsScreen() {
  return (
    <Screen>
      <View style={styles.empty}>
        <Txt variant="h2">Records</Txt>
        <Txt variant="body" color={Colors.textSecondary}>
          Tes exercices apparaîtront ici. (L1)
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
