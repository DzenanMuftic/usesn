import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useStore } from '@/lib/store';
import { colors, radius } from '@/lib/theme';

const TOP_UP_AMOUNTS = [10, 25, 50];

export default function SettingsScreen() {
  const { profile, updateProfile, topUp } = useStore();
  const [name, setName] = useState(profile.displayName);
  const [handle, setHandle] = useState(profile.handle);

  const dirty = name !== profile.displayName || handle !== profile.handle;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Text style={styles.label}>Display name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.label}>Handle</Text>
          <TextInput
            style={styles.input}
            value={handle}
            onChangeText={setHandle}
            placeholder="handle"
            autoCapitalize="none"
            placeholderTextColor={colors.textMuted}
          />
          <Pressable
            style={[styles.saveButton, !dirty && styles.saveButtonDisabled]}
            disabled={!dirty}
            onPress={() => updateProfile({ displayName: name.trim() || 'Your Name', handle: handle.trim() || profile.handle })}
          >
            <Text style={styles.saveButtonText}>Save changes</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Top up balance</Text>
          <Text style={styles.balance}>${profile.balance.toFixed(2)}</Text>
          <View style={styles.topUpRow}>
            {TOP_UP_AMOUNTS.map((value) => (
              <Pressable key={value} style={styles.topUpChip} onPress={() => topUp(value)}>
                <Text style={styles.topUpChipText}>+${value}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.footer}>QR Tips · demo wallet stored on this device only</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, gap: 16 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  label: { color: colors.textMuted, fontSize: 12 },
  input: {
    backgroundColor: colors.bgAlt,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  saveButton: {
    marginTop: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.4 },
  saveButtonText: { color: '#FFFFFF', fontWeight: '600' },
  balance: { color: colors.text, fontSize: 28, fontWeight: '700' },
  topUpRow: { flexDirection: 'row', gap: 10 },
  topUpChip: {
    backgroundColor: colors.bgAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  topUpChipText: { color: colors.text, fontWeight: '600' },
  footer: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 8 },
});
