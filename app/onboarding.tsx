import { useMutation } from 'convex/react'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { api } from '@convex/_generated/api'
import { Button } from '@/components/Button'
import { Screen } from '@/components/Screen'
import { TextField } from '@/components/TextField'
import { Txt } from '@/components/Txt'
import { Colors, Spacing } from '@/constants/theme'

/**
 * Écran 2 de l'onboarding (SPEC §9). Nom, taille, poids : entièrement sautable.
 * Taille et poids sont purement informatifs — aucun objectif, aucun message santé.
 */
export default function Onboarding() {
  const ensureProfile = useMutation(api.players.ensureProfile)
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [saving, setSaving] = useState(false)

  const finish = async (withProfile: boolean) => {
    setSaving(true)
    try {
      if (withProfile) {
        const heightCm = Number.parseFloat(height)
        const weightKg = Number.parseFloat(weight)
        await ensureProfile({
          displayName: displayName.trim() || undefined,
          heightCm: Number.isFinite(heightCm) ? heightCm : undefined,
          weightKg: Number.isFinite(weightKg) ? weightKg : undefined,
        })
      } else {
        await ensureProfile({})
      }
      router.replace('/(tabs)')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen centered>
      <View style={styles.form}>
        <Txt variant="h1">Ton profil</Txt>
        <Txt variant="body" color={Colors.textSecondary}>
          Facultatif. Tu peux passer et compléter plus tard.
        </Txt>

        <TextField
          label="Nom affiché"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Ippo"
          autoCapitalize="words"
          autoComplete="name"
        />
        <TextField
          label="Taille (cm)"
          value={height}
          onChangeText={setHeight}
          placeholder="175"
          keyboardType="numeric"
        />
        <TextField
          label="Poids (kg)"
          value={weight}
          onChangeText={setWeight}
          placeholder="70"
          keyboardType="numeric"
        />

        <Button label="Enregistrer" onPress={() => finish(true)} loading={saving} />
        <Button label="Passer" onPress={() => finish(false)} variant="ghost" disabled={saving} />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.lg,
  },
})
