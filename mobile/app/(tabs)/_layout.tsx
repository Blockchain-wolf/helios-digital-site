import { Tabs } from 'expo-router/js-tabs';
import { Text } from 'react-native';

import { couleurs } from '@/theme';

/** Icône d'onglet en emoji : évite une dépendance d'icônes supplémentaire. */
function icone(symbole: string) {
  return ({ focused }: { focused: boolean }) => (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{symbole}</Text>
  );
}

export default function DispositionOnglets() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: couleurs.fond },
        headerTintColor: couleurs.accentSombre,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        tabBarActiveTintColor: couleurs.accent,
        tabBarInactiveTintColor: couleurs.discret,
        tabBarStyle: {
          backgroundColor: couleurs.surface,
          borderTopColor: couleurs.bordure,
        },
        sceneStyle: { backgroundColor: couleurs.fond },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Tableau de bord', headerShown: false, tabBarIcon: icone('📊') }}
      />
      <Tabs.Screen
        name="clients"
        options={{ title: 'Clients', headerShown: false, tabBarIcon: icone('👥') }}
      />
      <Tabs.Screen
        name="documents"
        options={{ title: 'Devis & factures', headerShown: false, tabBarIcon: icone('🧾') }}
      />
      <Tabs.Screen
        name="reglages"
        options={{ title: 'Réglages', headerShown: false, tabBarIcon: icone('⚙️') }}
      />
    </Tabs>
  );
}
