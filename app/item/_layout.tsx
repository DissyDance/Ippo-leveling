import { Stack } from 'expo-router'
import { Colors, Fonts } from '@/constants/theme'

export default function ItemLayout() {
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
      <Stack.Screen name="new" options={{ title: 'Nouvel exercice', presentation: 'modal' }} />
      <Stack.Screen name="[id]/session" options={{ title: 'Session' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Modifier l’exercice', presentation: 'modal' }} />
    </Stack>
  )
}
