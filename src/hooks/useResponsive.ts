import { useWindowDimensions } from 'react-native'
import { Layout } from '@/constants/theme'

export type Responsive = {
  /** Largeur courante de la fenêtre. */
  width: number
  /** Vrai au-delà du breakpoint : consultation "ordinateur", pleine page. */
  isWide: boolean
}

/**
 * Adapte la mise en page au format d'écran (SPEC responsive).
 * Téléphone : contenu borné et centré. Ordinateur : pleine page.
 */
export function useResponsive(): Responsive {
  const { width } = useWindowDimensions()
  return { width, isWide: width >= Layout.wideBreakpoint }
}
