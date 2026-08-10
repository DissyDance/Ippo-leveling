import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue'
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter'
import { JetBrainsMono_400Regular, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { useFonts } from 'expo-font'
import { Slot, useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { useConvexAuth, useQuery } from 'convex/react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { api } from '@convex/_generated/api'
import { Colors } from '@/constants/theme'
import { authStorage } from '@/lib/authStorage'
import { convex } from '@/lib/convex'

void SplashScreen.preventAutoHideAsync()

/**
 * Auth gate (SPEC §8, L0). Redirige selon l'état :
 *  - non authentifié            → (auth)
 *  - authentifié sans joueur    → (onboarding)
 *  - authentifié avec joueur    → (tabs)
 */
function AuthGate() {
  const { isLoading, isAuthenticated } = useConvexAuth()
  const player = useQuery(api.players.getCurrentPlayer)
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    const group = segments[0]
    const inAuth = group === '(auth)'
    const inOnboarding = group === 'onboarding'

    if (!isAuthenticated) {
      if (!inAuth) router.replace('/(auth)/sign-in')
      return
    }
    if (player === undefined) return // joueur en cours de chargement
    if (player === null) {
      if (!inOnboarding) router.replace('/onboarding')
      return
    }
    if (inAuth || inOnboarding) router.replace('/(tabs)')
  }, [isLoading, isAuthenticated, player, segments, router])

  return <Slot />
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded) void SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaProvider>
        <ConvexAuthProvider client={convex} storage={authStorage} storageNamespace="ippoleveling">
          <AuthGate />
          <StatusBar style="light" />
        </ConvexAuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
