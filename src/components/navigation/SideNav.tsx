import { api } from '@convex/_generated/api'
import { useQuery } from 'convex/react'
import { usePathname, useRouter } from 'expo-router'
import { useState } from 'react'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import { Icon } from '@/components/Icon'
import { Txt } from '@/components/Txt'
import { Colors, Radius, Spacing } from '@/constants/theme'
import { TAB_ENTRIES } from './tabs.config'

export const SIDENAV_WIDTH = 240

// Destinations principales en haut ; Profil et Réglages épinglés en bas.
const PRIMARY = TAB_ENTRIES.filter((e) => e.name === 'index' || e.name === 'running')
const SECONDARY = TAB_ENTRIES.filter((e) => e.name === 'profile' || e.name === 'settings')

function isActive(pathname: string, path: string): boolean {
  if (path === '/') return pathname === '/' || pathname === '/index'
  return pathname === path || pathname.startsWith(path + '/')
}

/**
 * Rail de navigation latéral (web/large écran), inspiré de Leveling Master.
 * Rendu uniquement au-delà du breakpoint par (tabs)/_layout ; sur mobile la
 * BottomTabBar prend le relais. Pilote le routage via expo-router.
 */
export function SideNav() {
  const pathname = usePathname()
  const router = useRouter()
  const header = useQuery(api.players.getProfileHeader)
  const avatarUrl = header?.image ?? null
  const initial = (header?.name?.trim()?.[0] ?? '?').toUpperCase()

  const renderEntry = (entry: (typeof TAB_ENTRIES)[number]) => {
    const active = isActive(pathname, entry.path)
    const isProfile = entry.name === 'profile'
    return (
      <NavItem
        key={entry.path}
        label={entry.label}
        active={active}
        onPress={() => router.navigate(entry.path as never)}
      >
        {isProfile ? (
          avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={[styles.avatar, active && styles.avatarActive]} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback, active && styles.avatarActive]}>
              <Txt variant="caption" color={Colors.onPrimary}>
                {initial}
              </Txt>
            </View>
          )
        ) : (
          <Icon
            name={entry.icon}
            size={20}
            color={active ? Colors.primary : Colors.textSecondary}
            stroke={1.8}
          />
        )}
      </NavItem>
    )
  }

  return (
    <View style={styles.root}>
      <View style={styles.brand}>
        <View style={styles.brandDiamond} />
        <Txt variant="h2" color={Colors.primary} numberOfLines={1}>
          Ippo Leveling
        </Txt>
      </View>

      <View style={styles.group}>{PRIMARY.map(renderEntry)}</View>

      <View style={styles.spacer} />

      {/* Profil et Réglages épinglés en bas du rail (à la Notion / Leveling Master). */}
      <View style={styles.group}>{SECONDARY.map(renderEntry)}</View>

      <Txt variant="caption" color={Colors.textMuted} style={styles.footer}>
        SYSTEM · DESKTOP
      </Txt>
    </View>
  )
}

type NavItemProps = {
  label: string
  active: boolean
  onPress: () => void
  children: React.ReactNode
}

function NavItem({ label, active, onPress, children }: NavItemProps) {
  const [hovered, setHovered] = useState(false)
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[styles.item, (active || hovered) && styles.itemActive]}
      accessibilityRole="button"
      accessibilityState={active ? { selected: true } : {}}
      accessibilityLabel={label}
    >
      {active ? <View style={styles.activeBar} /> : null}
      {children}
      <Txt variant="body" color={active ? Colors.textPrimary : Colors.textSecondary}>
        {label}
      </Txt>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: {
    width: SIDENAV_WIDTH,
    height: '100%',
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  brandDiamond: {
    width: 10,
    height: 10,
    backgroundColor: Colors.primary,
    transform: [{ rotate: '45deg' }],
  },
  group: {
    gap: Spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    height: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
  },
  itemActive: {
    backgroundColor: Colors.surfaceElevated,
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 3,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarActive: {
    borderColor: Colors.primary,
  },
  avatarFallback: {
    backgroundColor: Colors.primaryDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    flex: 1,
  },
  footer: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
})
