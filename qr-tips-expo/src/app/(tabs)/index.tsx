import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { encodeTipQr } from '@/lib/qr';
import { useStore } from '@/lib/store';
import { colors, radius } from '@/lib/theme';

export default function MyQrScreen() {
  const { ready, profile } = useStore();

  const qrValue = useMemo(
    () =>
      encodeTipQr({
        userId: profile.userId,
        displayName: profile.displayName,
        handle: profile.handle,
      }),
    [profile.userId, profile.displayName, profile.handle]
  );

  if (!ready) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your balance</Text>
          <Text style={styles.balanceValue}>${profile.balance.toFixed(2)}</Text>
        </View>

        <View style={styles.qrCard}>
          <Text style={styles.qrHint}>Show this to get tipped</Text>
          <View style={styles.qrWrapper}>
            <QRCode value={qrValue} size={220} backgroundColor="#FFFFFF" color={colors.bg} />
          </View>
          <Text style={styles.name}>{profile.displayName}</Text>
          <Text style={styles.handle}>@{profile.handle}</Text>
        </View>

        <Pressable style={styles.scanButton} onPress={() => router.push('/scan')}>
          <Text style={styles.scanButtonText}>Scan a QR to tip someone</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, gap: 16, alignItems: 'stretch' },
  balanceCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  balanceLabel: { color: colors.textMuted, fontSize: 13, marginBottom: 6 },
  balanceValue: { color: colors.text, fontSize: 34, fontWeight: '700' },
  qrCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  qrHint: { color: colors.textMuted, fontSize: 13, marginBottom: 10 },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: radius.md,
    marginBottom: 14,
  },
  name: { color: colors.text, fontSize: 18, fontWeight: '600' },
  handle: { color: colors.textMuted, fontSize: 14 },
  scanButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  scanButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
