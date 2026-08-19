import type { IconName } from '@/components/Icon'

export type TabEntry = {
  /** Nom de la route dans (tabs) et chemin expo-router (`/` pour index). */
  name: string
  path: string
  label: string
  icon: IconName
}

/** Onglets principaux, dans l'ordre d'affichage (barre mobile + rail desktop). */
export const TAB_ENTRIES: TabEntry[] = [
  { name: 'index', path: '/', label: 'Records', icon: 'trophy' },
  { name: 'profile', path: '/profile', label: 'Profil', icon: 'user' },
  { name: 'settings', path: '/settings', label: 'Réglages', icon: 'gear' },
]
