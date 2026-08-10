// Déclaration de type partagée pour la résolution TypeScript.
// L'implémentation réelle est platform-split : Metro charge `authStorage.web.ts`
// sur web et `authStorage.native.ts` sur natif. TS résout ce `.d.ts`.
import type { TokenStorage } from '@convex-dev/auth/react'

export declare const authStorage: TokenStorage | undefined
