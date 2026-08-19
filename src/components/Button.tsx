import type { ReactNode } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'
import { Colors, Layout, Motion, Radius, Spacing } from '@/constants/theme'
import { Txt } from './Txt'

type Variant = 'primary' | 'secondary' | 'ghost'

type Props = {
  label: string
  onPress: () => void
  variant?: Variant
  disabled?: boolean
  loading?: boolean
  /** Icône optionnelle rendue avant le label (ex. logo Google). */
  icon?: ReactNode
}

/** Bouton. Animation d'appui GPU-only (transform: scale), jamais de width animé. */
export function Button({ label, onPress, variant = 'primary', disabled = false, loading = false, icon }: Props) {
  const isDisabled = disabled || loading
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        VARIANT_STYLE[variant],
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
      ]}
    >
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? Colors.onPrimary : Colors.textPrimary} />
        ) : (
          <>
            {icon}
            <Txt variant="h3" color={LABEL_COLOR[variant]}>
              {label}
            </Txt>
          </>
        )}
      </View>
    </Pressable>
  )
}

const LABEL_COLOR: Record<Variant, string> = {
  primary: Colors.onPrimary,
  secondary: Colors.textPrimary,
  ghost: Colors.textSecondary,
}

const VARIANT_STYLE = StyleSheet.create({
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.borderStrong },
  ghost: { backgroundColor: 'transparent' },
})

const styles = StyleSheet.create({
  base: {
    minHeight: Layout.minTouchTarget,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  pressed: {
    transform: [{ scale: Motion.pressScale }],
  },
  disabled: {
    opacity: 0.5,
  },
})
