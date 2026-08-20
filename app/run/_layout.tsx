import { Stack } from 'expo-router'
import { Colors, Fonts } from '@/constants/theme'

export default function RunLayout() {
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
      <Stack.Screen name="new" options={{ title: 'Nouvelle course', presentation: 'modal' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Modifier la course', presentation: 'modal' }} />
    </Stack>
  )
}
