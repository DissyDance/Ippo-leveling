import { useMutation, useQuery } from 'convex/react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import { RunForm, type RunFormValues } from '@/components/RunForm'
import { Txt } from '@/components/Txt'
import { Colors } from '@/constants/theme'

export default function EditRun() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const runId = id as Id<'runs'>
  const router = useRouter()
  const run = useQuery(api.running.get, { runId })
  const update = useMutation(api.running.update)
  const remove = useMutation(api.running.remove)
  const [deleting, setDeleting] = useState(false)

  if (run === undefined) {
    return (
      <View style={styles.center}>
        <Txt variant="body" color={Colors.textSecondary}>
          Chargement…
        </Txt>
      </View>
    )
  }
  if (run === null) {
    return (
      <View style={styles.center}>
        <Txt variant="body" color={Colors.textSecondary}>
          Course introuvable.
        </Txt>
      </View>
    )
  }

  const submit = async (values: RunFormValues) => {
    await update({ runId, ...values })
    router.back()
  }

  const onDelete = async () => {
    setDeleting(true)
    try {
      await remove({ runId })
      router.back()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <RunForm
      initial={{
        performedAt: run.performedAt,
        distanceMeters: run.distanceMeters,
        durationSeconds: run.durationSeconds,
      }}
      submitLabel="Enregistrer"
      onSubmit={submit}
      onDelete={onDelete}
      deleting={deleting}
    />
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
})
