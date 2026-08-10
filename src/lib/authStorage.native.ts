// Natif (iOS / Android) : stockage sécurisé des jetons via expo-secure-store.
import * as SecureStore from 'expo-secure-store'
import type { TokenStorage } from '@convex-dev/auth/react'

export const authStorage: TokenStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
}
