import { useMutation } from 'convex/react'
import { useRouter } from 'expo-router'
import { api } from '@convex/_generated/api'
import { RunForm, type RunFormValues } from '@/components/RunForm'

export default function NewRun() {
  const router = useRouter()
  const record = useMutation(api.running.record)

  const submit = async (values: RunFormValues) => {
    await record(values)
    router.back()
  }

  return <RunForm submitLabel="Enregistrer la course" onSubmit={submit} />
}
