import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StoreProvider } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="scan" options={{ title: 'Scan to Tip', presentation: 'modal' }} />
          <Stack.Screen
            name="tip/[userId]"
            options={{ title: 'Send a Tip', presentation: 'modal' }}
          />
        </Stack>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
