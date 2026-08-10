/**
 * Convex Auth — Password + Google (SPEC §9, écran 1 de l'onboarding).
 *
 * Google lit ses identifiants depuis les variables d'environnement Convex
 * AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET (à définir côté dashboard Convex).
 */
import Google from '@auth/core/providers/google'
import { Password } from '@convex-dev/auth/providers/Password'
import { convexAuth } from '@convex-dev/auth/server'

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Google],
})
