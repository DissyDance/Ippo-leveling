import { Tabs } from 'expo-router'
import { Colors, Fonts, Layout } from '@/constants/theme'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTitleStyle: { color: Colors.textPrimary, fontFamily: Fonts.display, letterSpacing: 1 },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: Colors.background },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: Layout.tabBarHeight,
        },
        tabBarLabelStyle: { fontFamily: Fonts.uiMedium },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Records' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
      <Tabs.Screen name="settings" options={{ title: 'Réglages' }} />
    </Tabs>
  )
}
