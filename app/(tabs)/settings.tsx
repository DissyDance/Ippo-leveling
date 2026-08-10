import { useAuthActions } from '@convex-dev/auth/react'
import { useQuery } from 'convex/react'
import { StyleSheet, View } from 'react-native'
import { api } from '@convex/_generated/api'
import { Button } from '@/components/Button'
import { Screen } from '@/components/Screen'
import { Txt } from '@/components/Txt'
import { Colors, Spacing } from '@/constants/theme'

export default function SettingsScreen() {
  const { signOut } = useAuthActions()
  const player = useQuery(api.players.getCurrentPlayer)

  return (
    <Screen>
      <View style={styles.wrap}>
        <View style={styles.section}>
          <Txt variant="label" color={Colors.textSecondary}>
            COMPTE
          </Txt>
          <Txt variant="bodyLarge">{player?.displayName ?? 'Joueur'}</Txt>
        </View>

        <Button label="Se déconnecter" onPress={() => void signOut()} variant="secondary" />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingTop: Spacing.xl,
    gap: Spacing.xl,
    justifyContent: 'space-between',
    paddingBottom: Spacing.xxl,
  },
  section: {
    gap: Spacing.xs,
  },
})
