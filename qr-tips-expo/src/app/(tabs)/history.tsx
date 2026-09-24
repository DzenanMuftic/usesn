import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Transaction, useStore } from '@/lib/store';
import { colors, radius } from '@/lib/theme';

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function TransactionRow({ item }: { item: Transaction }) {
  const isReceived = item.direction === 'received';
  return (
    <View style={styles.row}>
      <View style={[styles.badge, isReceived ? styles.badgeIn : styles.badgeOut]}>
        <Text style={styles.badgeText}>{isReceived ? '+' : '−'}</Text>
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.counterparty}
        </Text>
        {item.note ? (
          <Text style={styles.rowNote} numberOfLines={1}>
            {item.note}
          </Text>
        ) : null}
        <Text style={styles.rowDate}>{formatDate(item.createdAt)}</Text>
      </View>
      <Text style={[styles.rowAmount, isReceived ? styles.amountIn : styles.amountOut]}>
        {isReceived ? '+' : '-'}${item.amount.toFixed(2)}
      </Text>
    </View>
  );
}

export default function HistoryScreen() {
  const { transactions } = useStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionRow item={item} />}
        contentContainerStyle={
          transactions.length === 0 ? styles.emptyContainer : styles.listContainer
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No activity yet</Text>
            <Text style={styles.emptyBody}>Tips you send or receive will show up here.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  listContainer: { padding: 20 },
  emptyContainer: { flex: 1 },
  separator: { height: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 12,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIn: { backgroundColor: 'rgba(51,214,166,0.18)' },
  badgeOut: { backgroundColor: 'rgba(255,107,107,0.18)' },
  badgeText: { color: colors.text, fontWeight: '700', fontSize: 16 },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  rowNote: { color: colors.textMuted, fontSize: 13 },
  rowDate: { color: colors.textMuted, fontSize: 12 },
  rowAmount: { fontSize: 15, fontWeight: '700' },
  amountIn: { color: colors.accent },
  amountOut: { color: colors.danger },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 24 },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  emptyBody: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
});
