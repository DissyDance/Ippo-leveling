/**
 * Circuits — calculs purs partagés (formulaire, liste, détail, séance).
 *
 * Le total de répétitions et le volume ne sont jamais stockés sur le circuit :
 * ils se dérivent ici depuis les exercices. `totalReps` est l'unique métrique
 * comparée pour battre le record d'un circuit (plus haut = mieux). Fonctions
 * pures, sans dépendance React/Convex.
 */

/** Un exercice de circuit : nom, poids (kg) et répétitions. Compatible Doc. */
export type CircuitExercise = {
  name: string
  load: number
  reps: number
}

/** Somme des répétitions sur l'ensemble des exercices. */
export function totalReps(exercises: readonly CircuitExercise[]): number {
  return exercises.reduce((acc, e) => acc + (Number.isFinite(e.reps) ? e.reps : 0), 0)
}

/** Volume total = Σ reps × poids (kg soulevés cumulés). */
export function totalVolumeKg(exercises: readonly CircuitExercise[]): number {
  return exercises.reduce(
    (acc, e) => acc + (Number.isFinite(e.reps) && Number.isFinite(e.load) ? e.reps * e.load : 0),
    0,
  )
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
