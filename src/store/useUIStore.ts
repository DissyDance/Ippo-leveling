import { create } from 'zustand'

/**
 * State UI éphémère UNIQUEMENT (SPEC §10) : toasts, modales, séquence de
 * célébration. Tout ce qui persiste va dans Convex, jamais ici.
 *
 * L0 : socle. La séquence de célébration record sera branchée en L1.
 */
type UIState = {
  celebrationVisible: boolean
  showCelebration: () => void
  hideCelebration: () => void
}

export const useUIStore = create<UIState>((set) => ({
  celebrationVisible: false,
  showCelebration: () => set({ celebrationVisible: true }),
  hideCelebration: () => set({ celebrationVisible: false }),
}))
