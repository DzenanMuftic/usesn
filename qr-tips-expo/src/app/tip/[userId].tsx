import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useStore } from '@/lib/store';
import { colors, radius } from '@/lib/theme';

const PRESETS = [2, 5, 10, 20];

export default function TipScreen() {
  const { userId, name, handle } = useLocalSearchParams<{
    userId: string;
    name?: string;
    handle?: string;
  }>();
  const { profile, sendTip } = useStore();
  const [amount, setAmount] = useState('5');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const numericAmount = Number(amount);
  const isValid = Number.isFinite(numericAmount) && numericAmount > 0;

  const handleSend = async () => {
    if (!isValid) return;
    if (numericAmount > profile.balance) {
      Alert.alert('Insufficient balance', 'Top up your balance from the Profile tab first.');
      return;
    }
    setSending(true);
    try {
      await sendTip({
        counterparty: name ? `${name} (@${handle})` : userId,
        amount: numericAmount,
        note: note.trim() || undefined,
      });
      router.dismissTo('/');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.recipientCard}>
          <Text style={styles.recipientLabel}>Sending a tip to</Text>
          <Text style={styles.recipientName}>{name ?? 'Someone'}</Text>
          {handle ? <Text style={styles.recipientHandle}>@{handle}</Text> : null}
        </View>

        <Text style={styles.sectionLabel}>Amount</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currency}>$</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.presetRow}>
          {PRESETS.map((preset) => (
            <Pressable
              key={preset}
              style={styles.presetChip}
              onPress={() => setAmount(String(preset))}
            >
              <Text style={styles.presetChipText}>${preset}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Note (optional)</Text>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="Great service, thank you!"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.balanceHint}>Balance: ${profile.balance.toFixed(2)}</Text>

        <Pressable
          style={[styles.sendButton, (!isValid || sending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!isValid || sending}
        >
          <Text style={styles.sendButtonText}>
            {sending ? 'Sending…' : `Send $${isValid ? numericAmount.toFixed(2) : '0.00'}`}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: 20, gap: 14 },
  recipientCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: 8,
  },
  recipientLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 4 },
  recipientName: { color: colors.text, fontSize: 20, fontWeight: '700' },
  recipientHandle: { color: colors.textMuted, fontSize: 14 },
  sectionLabel: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  currency: { color: colors.text, fontSize: 28, fontWeight: '700', marginRight: 4 },
  amountInput: { flex: 1, color: colors.text, fontSize: 28, fontWeight: '700', paddingVertical: 12 },
  presetRow: { flexDirection: 'row', gap: 10 },
  presetChip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  presetChipText: { color: colors.text, fontWeight: '600' },
  noteInput: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  balanceHint: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  sendButton: {
    marginTop: 'auto',
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendButtonText: { color: '#08281E', fontSize: 16, fontWeight: '700' },
});
