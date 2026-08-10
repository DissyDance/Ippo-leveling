import { Link } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { AuthCredentials } from '@/components/AuthCredentials'
import { Txt } from '@/components/Txt'
import { Colors, Spacing } from '@/constants/theme'

export default function SignIn() {
  return (
    <View style={styles.wrap}>
      <AuthCredentials flow="signIn" title="Connexion" submitLabel="Se connecter" />
      <View style={styles.footer}>
        <Txt variant="bodySmall" color={Colors.textSecondary}>
          Pas encore de compte ?{' '}
        </Txt>
        <Link href="/(auth)/sign-up">
          <Txt variant="bodySmall" color={Colors.gold}>
            Créer un compte
          </Txt>
        </Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing.xxl,
  },
})
