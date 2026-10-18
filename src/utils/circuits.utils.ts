/**
 * Circuits — helpers purs partagés (formulaire, liste, détail, séance).
 *
 * Le nombre de tours du circuit (métrique de record) est saisi par le joueur à
 * chaque séance, jamais dérivé ici. Fonctions pures, sans dépendance
 * React/Convex.
 */

/** Un exercice de circuit : nom, poids (kg) et répétitions. Compatible Doc. */
export type CircuitExercise = {
  name: string
  load: number
  reps: number
}

/** « 40 reps » / « 40 reps @ 20 kg » — une ligne d'exercice lisible. */
export function formatExercise(exercise: CircuitExercise): string {
  const reps = `${exercise.reps} rep${exercise.reps > 1 ? 's' : ''}`
  return exercise.load > 0 ? `${reps} @ ${exercise.load} kg` : reps
}

/** Date lisible « 14 sept. 2026 ». */
export function formatCircuitDate(ms: number): string {
  return new Date(ms).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
