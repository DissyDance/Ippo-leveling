import { Text, type TextProps, type TextStyle } from 'react-native'
import { Colors, Typography } from '@/constants/theme'

type Variant = keyof typeof Typography

type Props = TextProps & {
  variant?: Variant
  color?: string
}

/** Texte typé sur les tokens de theme.ts. Aucune taille/couleur en dur ailleurs. */
export function Txt({ variant = 'body', color = Colors.textPrimary, style, ...rest }: Props) {
  return <Text {...rest} style={[Typography[variant] as TextStyle, { color }, style]} />
}
