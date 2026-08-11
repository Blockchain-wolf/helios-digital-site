import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FournisseurDonnees } from '@/store';
import { couleurs } from '@/theme';

export default function DispositionRacine() {
  return (
    <SafeAreaProvider>
      <FournisseurDonnees>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: couleurs.fond },
            headerTintColor: couleurs.accentSombre,
            headerTitleStyle: { fontWeight: '700' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: couleurs.fond },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="clients/[id]" options={{ title: 'Fiche client' }} />
          <Stack.Screen name="clients/edition" options={{ title: 'Client' }} />
          <Stack.Screen name="documents/[id]" options={{ title: 'Document' }} />
          <Stack.Screen name="documents/edition" options={{ title: 'Édition' }} />
        </Stack>
      </FournisseurDonnees>
    </SafeAreaProvider>
  );
}
