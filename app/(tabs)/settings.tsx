import { useAuthActions } from '@convex-dev/auth/react'
import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import { api } from '@convex/_generated/api'
import { Button } from '@/components/Button'
import { Screen } from '@/components/Screen'
import { Txt } from '@/components/Txt'
import { Colors, Radius, Spacing, Typography } from '@/constants/theme'

export default function SettingsScreen() {
  const { signOut } = useAuthActions()
  const player = useQuery(api.players.getCurrentPlayer)
  const submitFeedback = useMutation(api.feedback.submit)

  const [feedbackText, setFeedbackText] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)

  const sendFeedback = async () => {
    const trimmed = feedbackText.trim()
    if (trimmed.length === 0) return
    setSending(true)
    setStatus(null)
    try {
      await submitFeedback({ message: trimmed })
      setFeedbackText('')
      setStatus({ ok: true, text: 'Merci ! Ton retour a bien été transmis.' })
    } catch (err) {
      setStatus({ ok: false, text: err instanceof Error ? err.message : 'Envoi impossible.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <Screen>
      <View style={styles.wrap}>
        <View style={styles.top}>
          <View style={styles.section}>
            <Txt variant="label" color={Colors.textSecondary}>
              COMPTE
            </Txt>
            <Txt variant="bodyLarge">{player?.displayName ?? 'Joueur'}</Txt>
          </View>

          <View style={styles.section}>
            <Txt variant="label" color={Colors.textSecondary}>
              FEEDBACK
            </Txt>
            <Txt variant="bodySmall" color={Colors.textMuted}>
              Une idée, un bug, une envie ? Dis-nous tout, ça aide à améliorer l’app.
            </Txt>
            <TextInput
              style={styles.input}
              placeholder="Ton retour…"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              maxLength={2000}
              value={feedbackText}
              onChangeText={setFeedbackText}
              textAlignVertical="top"
            />
            {status ? (
              <Txt variant="bodySmall" color={status.ok ? Colors.success : Colors.crimson}>
                {status.text}
              </Txt>
            ) : null}
            <Button
              label="Envoyer"
              onPress={sendFeedback}
              loading={sending}
              disabled={feedbackText.trim().length === 0}
              variant="secondary"
            />
          </View>
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
  top: {
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.sm,
  },
  input: {
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 96,
  },
})
