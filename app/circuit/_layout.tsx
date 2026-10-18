import { Stack } from 'expo-router'
import { Colors, Fonts } from '@/constants/theme'

export default function CircuitLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.primary,
        headerTitleStyle: { color: Colors.textPrimary, fontFamily: Fonts.display },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="new" options={{ title: 'Nouveau circuit', presentation: 'modal' }} />
      <Stack.Screen name="[id]/index" options={{ title: 'Circuit' }} />
      <Stack.Screen name="[id]/session" options={{ title: 'Séance' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Modifier le circuit', presentation: 'modal' }} />
    </Stack>
  )
}
