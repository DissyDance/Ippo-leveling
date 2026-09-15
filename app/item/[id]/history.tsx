import { FlashList } from '@shopify/flash-list'
import { useQuery } from 'convex/react'
import { useLocalSearchParams } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { api } from '@convex/_generated/api'
import type { Doc, Id } from '@convex/_generated/dataModel'
import { Txt } from '@/components/Txt'
import { Colors, FIELD_CONFIG, Layout, Radius, Spacing } from '@/constants/theme'
import { useResponsive } from '@/hooks/useResponsive'
import { formatConditions, formatField } from '@/utils/format'

/** Date lisible : « 14 sept. 2026 ». */
const formatDate = (ms: number): string =>
  new Date(ms).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

export default function HistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const itemId = id as Id<'items'>
  const { isWide } = useResponsive()
  const data = useQuery(api.items.getItem, { itemId })
  const sessions = useQuery(api.sessions.listByItem, { itemId })

  const item = data?.item

  if (data === undefined || sessions === undefined) {
    return (
      <View style={styles.center}>
        <Txt variant="body" color={Colors.textSecondary}>
          Chargement…
        </Txt>
      </View>
    )
  }
  if (!item) {
    return (
      <View style={styles.center}>
        <Txt variant="body" color={Colors.textSecondary}>
          Exercice introuvable.
        </Txt>
      </View>
    )
  }

  const primaryLabel = FIELD_CONFIG[item.primaryMetric].label

  const renderSession = ({ item: session }: { item: Doc<'sessions'> }) => {
    const conditions = formatConditions(session.values, item.enabledFields, item.primaryMetric)
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Txt variant="caption" color={Colors.textMuted}>
            {formatDate(session.performedAt)}
          </Txt>
          {session.isPersonalRecord ? (
            <View style={styles.prBadge}>
              <Txt variant="label" color={Colors.onPrimary}>
                RECORD
              </Txt>
            </View>
          ) : null}
        </View>

        <Txt variant="recordValue" color={Colors.primary}>
          {formatField(item.primaryMetric, session.primaryValue)}
        </Txt>
        {conditions ? (
          <Txt variant="bodySmall" color={Colors.textSecondary}>
            {conditions}
          </Txt>
        ) : null}

        <View style={styles.cardFooter}>
          <Txt variant="caption" color={Colors.primarySoft}>
            +{session.xpGained} XP
          </Txt>
          {session.notes ? (
            <Txt variant="bodySmall" color={Colors.textSecondary} style={styles.notes}>
              {session.notes}
            </Txt>
          ) : null}
        </View>
      </View>
    )
  }

  return (
    <FlashList
      data={sessions}
      keyExtractor={(s: Doc<'sessions'>) => s._id}
      renderItem={renderSession}
      ItemSeparatorComponent={() => <View style={styles.sep} />}
      contentContainerStyle={[
        styles.list,
        isWide ? styles.listWide : styles.listNarrow,
      ]}
      ListHeaderComponent={
        <View style={styles.header}>
          <Txt variant="h2">{item.name}</Txt>
          <Txt variant="caption" color={Colors.textMuted}>
            {item.sessionCount} session{item.sessionCount > 1 ? 's' : ''} · RECORD sur {primaryLabel}
          </Txt>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Txt variant="body" color={Colors.textSecondary}>
            Aucune session enregistrée pour cet exercice.
          </Txt>
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  list: {
    padding: Spacing.lg,
    width: '100%',
    alignSelf: 'center',
  },
  listNarrow: {
    maxWidth: Layout.maxContentWidth,
  },
  listWide: {
    paddingHorizontal: Layout.screenPaddingWide,
  },
  header: {
    gap: Spacing.xxs,
    paddingBottom: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Layout.cardPadding,
    gap: Spacing.xxs,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  prBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
  },
  cardFooter: {
    marginTop: Spacing.xs,
    gap: Spacing.xxs,
  },
  notes: {
    fontStyle: 'italic',
  },
  sep: {
    height: Spacing.md,
  },
  empty: {
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },
})
