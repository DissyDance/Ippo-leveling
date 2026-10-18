import { useMutation, useQuery } from 'convex/react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import { CircuitForm, type CircuitFormValues } from '@/components/CircuitForm'
import { Txt } from '@/components/Txt'
import { Colors } from '@/constants/theme'

export default function EditCircuit() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const circuitId = id as Id<'circuits'>
  const router = useRouter()
  const data = useQuery(api.circuits.getCircuit, { circuitId })
  const update = useMutation(api.circuits.update)
  const archive = useMutation(api.circuits.archive)
  const [deleting, setDeleting] = useState(false)

  if (data === undefined) {
    return (
      <View style={styles.center}>
        <Txt variant="body" color={Colors.textSecondary}>
          Chargement…
        </Txt>
      </View>
    )
  }
  if (data === null) {
    return (
      <View style={styles.center}>
        <Txt variant="body" color={Colors.textSecondary}>
          Circuit introuvable.
        </Txt>
      </View>
    )
  }

  const circuit = data.circuit

  const submit = async (values: CircuitFormValues) => {
    await update({
      circuitId,
      name: values.name,
      description: values.description ?? '',
      exercises: values.exercises,
    })
    router.back()
  }

  const onDelete = async () => {
    setDeleting(true)
    try {
      await archive({ circuitId })
      // Retour direct à la liste : la fiche du circuit archivé n'existe plus.
      router.replace('/circuits')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <CircuitForm
      initial={{
        name: circuit.name,
        description: circuit.description ?? null,
        exercises: circuit.exercises,
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
