import { Fragment, memo } from 'react'
import { View } from 'react-native'
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg'
import { Colors, Fonts, STAT_CONFIG, STATS } from '@/constants/theme'

type Props = {
  /** Niveau par caractéristique, dans l'ordre de STATS (6 valeurs). */
  levels: number[]
  size?: number
}

const RINGS = [0.34, 0.67, 1]

function polarToXY(cx: number, cy: number, radius: number, index: number): [number, number] {
  const angle = -Math.PI / 2 + index * (Math.PI / 3)
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]
}

function RadarChartBase({ levels, size = 260 }: Props) {
  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 34 // marge pour les labels
  const maxLevel = Math.max(5, ...levels)
  const niceMax = Math.ceil(maxLevel / 5) * 5

  const dataPoints = STATS.map((stat, i) => {
    const ratio = (levels[i] ?? 0) / niceMax
    const [x, y] = polarToXY(cx, cy, radius * ratio, i)
    return { stat, x, y }
  })
  const polygon = dataPoints.map(({ x, y }) => `${x},${y}`).join(' ')

  return (
    <View>
      <Svg width={size} height={size}>
        {/* Anneaux de grille */}
        {RINGS.map((ring) => {
          const pts = STATS.map((_, i) => polarToXY(cx, cy, radius * ring, i))
            .map(([x, y]) => `${x},${y}`)
            .join(' ')
          return <Polygon key={ring} points={pts} fill="none" stroke={Colors.border} strokeWidth={1} />
        })}

        {/* Axes + labels */}
        {STATS.map((stat, i) => {
          const [ax, ay] = polarToXY(cx, cy, radius, i)
          const [lx, ly] = polarToXY(cx, cy, radius + 16, i)
          return (
            <Fragment key={stat}>
              <Line x1={cx} y1={cy} x2={ax} y2={ay} stroke={Colors.borderNeutral} strokeWidth={1} />
              <SvgText
                x={lx}
                y={ly}
                fill={STAT_CONFIG[stat].color}
                fontSize={12}
                fontFamily={Fonts.uiMedium}
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {stat}
              </SvgText>
            </Fragment>
          )
        })}

        {/* Aire de données */}
        <Polygon points={polygon} fill={Colors.gold} fillOpacity={0.22} stroke={Colors.gold} strokeWidth={2} />
        {dataPoints.map(({ stat, x, y }) => (
          <Circle key={stat} cx={x} cy={y} r={3} fill={STAT_CONFIG[stat].color} />
        ))}
      </Svg>
    </View>
  )
}

export const RadarChart = memo(RadarChartBase)
