// Web : on laisse ConvexAuthProvider utiliser `localStorage` par défaut.
// SURTOUT ne jamais importer expo-secure-store ici : cela casse le bundle web
// avec « getValueWithKeyAsync is not a function ».
import type { TokenStorage } from '@convex-dev/auth/react'

export const authStorage: TokenStorage | undefined = undefined
