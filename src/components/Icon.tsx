import Svg, { Circle, Path } from 'react-native-svg'

export type IconName = 'trophy' | 'user' | 'gear'

type Props = {
  name: IconName
  size?: number
  color?: string
  stroke?: number
}

/**
 * Jeu d'icônes vectorielles (tracé, style Lucide) rendu via react-native-svg.
 * Aucune dépendance de police d'icônes : chaque glyphe est un ensemble de
 * tracés dans un viewBox 24×24.
 */
export function Icon({ name, size = 24, color = '#F5F3F0', stroke = 1.8 }: Props) {
  const common = {
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'trophy' && (
        <>
          <Path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" {...common} />
          <Path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" {...common} />
          <Path d="M4 22h16" {...common} />
          <Path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" {...common} />
          <Path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" {...common} />
          <Path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" {...common} />
        </>
      )}
      {name === 'user' && (
        <>
          <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" {...common} />
          <Circle cx={12} cy={7} r={4} {...common} />
        </>
      )}
      {name === 'gear' && (
        <>
          <Path d="M20 7h-9" {...common} />
          <Path d="M14 17H5" {...common} />
          <Circle cx={17} cy={7} r={3} {...common} />
          <Circle cx={7} cy={17} r={3} {...common} />
        </>
      )}
    </Svg>
  )
}
