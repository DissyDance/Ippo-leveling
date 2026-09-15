import { FlashList } from '@shopify/flash-list'
import { useQuery } from 'convex/react'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { api } from '@convex/_generated/api'
import { ItemCard, type ItemEntry } from '@/components/ItemCard'
import { Screen } from '@/components/Screen'
import { StatPill } from '@/components/StatPill'
import { Txt } from '@/components/Txt'
import {
  CATEGORIES,
  CATEGORY_CONFIG,
  Colors,
  RANKS,
  Radius,
  Spacing,
  STATS,
  type Category,
  type Rank,
  type Stat,
} from '@/constants/theme'

type SortMode = 'stale' | 'recent' | 'rank' | 'sessions'

const SORT_LABEL: Record<SortMode, string> = {
  stale: 'À réentraîner',
  recent: 'Récence',
  rank: 'Rang',
  sessions: 'Sessions',
}

export default function RecordsScreen() {
  const router = useRouter()
  const entries = useQuery(api.items.listActiveItems)
  const [statFilter, setStatFilter] = useState<Stat | null>(null)
  const [rankFilter, setRankFilter] = useState<Rank | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<Category | null>(null)
  const [sort, setSort] = useState<SortMode>('stale')

  const visible = useMemo(() => {
    if (!entries) return []
    const filtered = entries.filter(({ item }) => {
      if (statFilter && !item.statTargets.includes(statFilter)) return false
      if (rankFilter && item.rank !== rankFilter) return false
      if (categoryFilter && item.category !== categoryFilter) return false
      return true
    })
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      if (sort === 'sessions') return b.item.sessionCount - a.item.sessionCount
      if (sort === 'rank') return RANKS.indexOf(b.item.rank) - RANKS.indexOf(a.item.rank)
      // 'stale' : plus vieux (ou jamais entraîné) en premier → à réentraîner.
      if (sort === 'stale') return (a.item.lastSessionAt ?? 0) - (b.item.lastSessionAt ?? 0)
      return (b.item.lastSessionAt ?? 0) - (a.item.lastSessionAt ?? 0)
    })
    return sorted
  }, [entries, statFilter, rankFilter, categoryFilter, sort])

  const cycleSort = () => {
    setSort((s) =>
      s === 'stale' ? 'recent' : s === 'recent' ? 'rank' : s === 'rank' ? 'sessions' : 'stale',
    )
  }

  return (
    <Screen>
      <FlashList
        data={visible}
        keyExtractor={(entry: ItemEntry) => entry.item._id}
        renderItem={({ item: entry }: { item: ItemEntry }) => (
          <ItemCard
            entry={entry}
            onPress={() =>
              router.push({ pathname: '/item/[id]/session', params: { id: entry.item._id } })
            }
            onEdit={() =>
              router.push({ pathname: '/item/[id]/edit', params: { id: entry.item._id } })
            }
            onHistory={() =>
              router.push({ pathname: '/item/[id]/history', params: { id: entry.item._id } })
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Txt variant="h1">Records</Txt>
              <Pressable
                onPress={() => router.push('/item/new')}
                accessibilityRole="button"
                style={styles.newBtn}
              >
                <Txt variant="h3" color={Colors.onPrimary}>
                  + Nouvel exercice
                </Txt>
              </Pressable>
            </View>

            <View style={styles.filterRow}>
              {STATS.map((stat) => (
                <StatPill
                  key={stat}
                  stat={stat}
                  selected={statFilter === stat}
                  onPress={() => setStatFilter((s) => (s === stat ? null : stat))}
                />
              ))}
            </View>

            <View style={styles.filterRow}>
              {RANKS.map((rank) => (
                <Pressable
                  key={rank}
                  onPress={() => setRankFilter((r) => (r === rank ? null : rank))}
                  style={[styles.rankChip, rankFilter === rank ? styles.rankChipOn : null]}
                >
                  <Txt variant="label" color={rankFilter === rank ? Colors.primary : Colors.textMuted}>
                    {rank}
                  </Txt>
                </Pressable>
              ))}
              <Pressable onPress={cycleSort} style={styles.sortChip}>
                <Txt variant="label" color={Colors.textSecondary}>
                  Tri : {SORT_LABEL[sort]}
                </Txt>
              </Pressable>
            </View>

            <View style={styles.filterRow}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategoryFilter((c) => (c === cat ? null : cat))}
                  style={[styles.rankChip, categoryFilter === cat ? styles.rankChipOn : null]}
                >
                  <Txt
                    variant="label"
                    color={categoryFilter === cat ? Colors.primary : Colors.textMuted}
                  >
                    {CATEGORY_CONFIG[cat].label}
                  </Txt>
                </Pressable>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          entries === undefined ? null : (
            <View style={styles.empty}>
              <Txt variant="body" color={Colors.textSecondary}>
                Aucun exercice. Crée ton premier avec « + Nouvel exercice ».
              </Txt>
            </View>
          )
        }
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: Spacing.lg,
  },
  header: {
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  newBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    alignItems: 'center',
  },
  rankChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderNeutral,
  },
  rankChipOn: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceElevated,
  },
  sortChip: {
    marginLeft: 'auto',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceElevated,
  },
  sep: {
    height: Spacing.md,
  },
  empty: {
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },
})
