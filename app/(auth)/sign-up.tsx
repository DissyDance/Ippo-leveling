import { Link } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { AuthCredentials } from '@/components/AuthCredentials'
import { Txt } from '@/components/Txt'
import { Colors, Spacing } from '@/constants/theme'

export default function SignUp() {
  return (
    <View style={styles.wrap}>
      <AuthCredentials flow="signUp" title="Créer un compte" submitLabel="S’inscrire" />
      <View style={styles.footer}>
        <Txt variant="bodySmall" color={Colors.textSecondary}>
          Déjà un compte ?{' '}
        </Txt>
        <Link href="/(auth)/sign-in">
          <Txt variant="bodySmall" color={Colors.primary}>
            Se connecter
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
