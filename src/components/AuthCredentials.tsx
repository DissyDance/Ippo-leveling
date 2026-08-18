import { useAuthActions } from '@convex-dev/auth/react'
import * as Linking from 'expo-linking'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Colors, Spacing } from '@/constants/theme'
import { Button } from './Button'
import { Screen } from './Screen'
import { TextField } from './TextField'
import { Txt } from './Txt'

type Props = {
  flow: 'signIn' | 'signUp'
  title: string
  submitLabel: string
}

/** Écran 1 de l'onboarding (SPEC §9) : email + mot de passe, ou Google. */
export function AuthCredentials({ flow, title, submitLabel }: Props) {
  const { signIn } = useAuthActions()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setError(null)
    setLoading(true)
    try {
      await signIn('password', { email, password, flow })
    } catch {
      setError(
        flow === 'signIn'
          ? 'Identifiants invalides.'
          : 'Impossible de créer le compte. Vérifie l’email et le mot de passe.',
      )
    } finally {
      setLoading(false)
    }
  }

  const google = async () => {
    setError(null)
    try {
      await signIn('google', { redirectTo: Linking.createURL('/') })
    } catch {
      setError('Connexion Google impossible.')
    }
  }

  return (
    <Screen centered>
      <View style={styles.form}>
        <Txt variant="hero" color={Colors.primary}>
          IPPO
        </Txt>
        <Txt variant="h2">{title}</Txt>

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="toi@exemple.com"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TextField
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          autoComplete="password"
        />

        {error ? (
          <Txt variant="bodySmall" color={Colors.crimson}>
            {error}
          </Txt>
        ) : null}

        <Button label={submitLabel} onPress={submit} loading={loading} />
        <Button label="Continuer avec Google" onPress={google} variant="secondary" />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.lg,
  },
})
