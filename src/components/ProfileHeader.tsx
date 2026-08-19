import { Image, StyleSheet, View } from 'react-native'
import { Colors, Radius, Spacing } from '@/constants/theme'
import { Txt } from './Txt'

type Props = {
  name: string
  image: string | null
}

const AVATAR = 56

/** En-tête du profil : avatar (photo Google ou initiales) + nom du joueur. */
export function ProfileHeader({ name, image }: Props) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <View style={styles.wrap}>
      {image ? (
        <Image source={{ uri: image }} style={styles.avatar} accessibilityIgnoresInvertColors />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Txt variant="h3" color={Colors.onPrimary}>
            {initials || '?'}
          </Txt>
        </View>
      )}
      <View style={styles.meta}>
        <Txt variant="label" color={Colors.textSecondary}>
          JOUEUR
        </Txt>
        <Txt variant="h2" numberOfLines={1}>
          {name}
        </Txt>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Colors.borderStrong,
  },
  avatarFallback: {
    backgroundColor: Colors.primaryDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
    gap: Spacing.xxs,
  },
})
