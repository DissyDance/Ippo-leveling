import { useMutation } from 'convex/react'
import { useRouter } from 'expo-router'
import { api } from '@convex/_generated/api'
import { CircuitForm, type CircuitFormValues } from '@/components/CircuitForm'

export default function NewCircuit() {
  const router = useRouter()
  const create = useMutation(api.circuits.create)

  const submit = async (values: CircuitFormValues) => {
    await create({
      name: values.name,
      description: values.description ?? undefined,
      exercises: values.exercises,
    })
    router.back()
  }

  return <CircuitForm submitLabel="Créer le circuit" onSubmit={submit} />
}
