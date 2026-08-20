import { Tabs } from 'expo-router'
import { View } from 'react-native'
import { BottomTabBar } from '@/components/navigation/BottomTabBar'
import { SideNav } from '@/components/navigation/SideNav'
import { Colors, Fonts } from '@/constants/theme'
import { useResponsive } from '@/hooks/useResponsive'

export default function TabsLayout() {
  const { isWide } = useResponsive()

  const tabs = (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTitleStyle: { color: Colors.textPrimary, fontFamily: Fonts.display, letterSpacing: 1 },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: Colors.background },
      }}
      // Barre mobile custom (icônes). Sur large écran, la SideNav remplace la barre.
      tabBar={(props) => (isWide ? null : <BottomTabBar {...props} />)}
    >
      <Tabs.Screen name="index" options={{ title: 'Records' }} />
      <Tabs.Screen name="running" options={{ title: 'Running' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
      <Tabs.Screen name="settings" options={{ title: 'Réglages' }} />
    </Tabs>
  )

  if (!isWide) return tabs

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: Colors.background }}>
      <SideNav />
      <View style={{ flex: 1 }}>{tabs}</View>
    </View>
  )
}
