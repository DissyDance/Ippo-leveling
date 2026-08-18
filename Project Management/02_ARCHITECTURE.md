# 🏗 Architecture — Ippo Leveling

> Complète `SPEC.md`. Décrit les couches, les flux runtime et les décisions
> architecturales (ADR). En cas de conflit avec le code, le code fait foi — mettre
> ce document à jour.

---

## 1. Vue globale en 4 couches

```
┌─────────────────────────────────────────────────────────┐
│  UI / Écrans        app/**  ·  src/components/**         │
│  (Expo Router, React Native, react-native-web)           │
├─────────────────────────────────────────────────────────┤
│  Logique partagée   src/utils/xp.utils · format          │
│  src/constants/theme  ·  src/hooks  ·  src/store         │
├─────────────────────────────────────────────────────────┤
│  Client Convex      useQuery / useMutation (réactif)     │
│  src/lib/convex  ·  ConvexAuthProvider                    │
├─────────────────────────────────────────────────────────┤
│  Backend Convex     convex/**  (queries, mutations,      │
│  schéma, validators, model/, auth, http)                 │
└─────────────────────────────────────────────────────────┘
```

Le même `src/utils/xp.utils.ts` est consommé côté UI (prévisualisation) et côté
backend (autorité). C'est la clé de la cohérence XP.

---

## 2. Stack décidée

- **Expo SDK 56 / RN 0.85 / React 19.2** — `newArchEnabled: true`.
- **Expo Router v6** — routing file-based, `typedRoutes` activé.
- **Convex** — DB + fonctions serveur réactives. Pas de REST maison.
- **Convex Auth** — Password + Google, storage platform-split.
- **Zustand 5** — state UI éphémère uniquement.
- **Reanimated 4 + Worklets** — animations GPU-only.
- **react-native-svg 15** — radar, futures courbes.
- **react-native-web** — parité web complète, hébergée sur Vercel.

Pas de `babel.config.js` (casse expo-router en SDK 56) ; alias via
`metro.config.js`.

---

## 3. Flux de données canonique — enregistrer une session

```
Écran session (app/item/[id]/session.tsx)
  │  saisit values (par champ activé), date, notes
  ▼
useMutation(api.sessions.record)
  ▼
convex/sessions.ts :: record   (atomique)
  1. auth + ownership item
  2. primaryValue = values[item.primaryMetric]
  3. isPR = isBetter(primaryValue, best?.primaryValue, direction)   ← xp.utils
  4. xpPerStat = xpPerStat(rank, statTargets.length, isPR)           ← xp.utils
  5. insert sessions (append-only)
  6. insert xpLogs × statTargets  +  patch players (XP par stat)
  7. patch items (sessionCount, lastSessionAt, currentTarget, PR ptr)
  8. applyConsistencyBonus(userId)  → bonus VOL hebdo
  ▼
retour { isPersonalRecord, xpPerStat, stats, consistency, level… }
  ▼
UI : célébration si record, récap XP
  ▼
useQuery réactifs (liste Records, profil) re-render automatiquement
```

---

## 4. Flux d'initialisation (cold start)

`app/_layout.tsx` :

1. Charge les 6 polices (`useFonts`) ; splash maintenu tant que non prêtes.
2. Monte les providers : `GestureHandlerRootView` → `SafeAreaProvider` →
   `ConvexAuthProvider` (client `src/lib/convex`, storage platform-split,
   `storageNamespace="ippoleveling"`).
3. **AuthGate** redirige selon l'état :
   - non authentifié → `(auth)/sign-in`
   - authentifié sans joueur (`getCurrentPlayer === null`) → `onboarding`
   - authentifié avec joueur → `(tabs)`
   - `player === undefined` → en cours de chargement, on attend.

---

## 5. Réactivité & performance

- **Convex `useQuery`** re-render à chaque mutation pertinente. Sur le profil
  (radar + 6 stats), mémoïser agressivement (`RadarChart` est `memo`, `ItemCard`
  est `memo`).
- **Listes** : `FlashList` obligatoire (jamais `FlatList`).
- **Animations** : `transform`/`opacity` uniquement, cible 60 fps milieu de gamme.
- **Responsive** : `useResponsive()` bascule les écrans entre colonne bornée
  (téléphone, `maxContentWidth` 560) et pleine page (`wideBreakpoint` 768, desktop).

---

## 6. Séparation des responsabilités

| Domaine | Où | Règle |
|---|---|---|
| Données persistées | `convex/` | Source de vérité. |
| Logique XP/progression | `src/utils/xp.utils.ts` | Pure, partagée client/serveur. |
| Formatage d'affichage | `src/utils/format.ts` | Pur, UI only. |
| Design tokens | `src/constants/theme.ts` | Couleurs/typo/spacing uniques. |
| State UI éphémère | `src/store/useUIStore.ts` | Toasts, célébration. Jamais de persistance. |
| Validators de forme | `convex/validators.ts` | Tokens partagés, vérifiés contre theme.ts à la compilation. |
| Helpers joueur | `convex/model/player.ts` | Accès unique au doc `players`. |
| Bonus régularité | `convex/model/consistency.ts` | Isolé de `record`. |

---

## 7. Décisions architecturales (ADR)

| # | Décision | Justification |
|---|---|---|
| A1 | Convex comme backend unique (DB + fonctions) | Réactivité gratuite, atomicité des handlers, zéro serveur à opérer. |
| A2 | `xp.utils.ts` partagé client/serveur, imports relatifs | Une seule vérité de calcul ; esbuild Convex ne gère pas les alias `@/`. |
| A3 | Validators partagés vérifiés contre les design tokens | `tsc` échoue si `validators.ts` et `theme.ts` divergent. |
| A4 | `sessions`/`xpLogs` append-only | Historique immuable, aucun recalcul rétroactif. |
| A5 | Record = pointeur `personalRecordSessionId` | Une seule source de vérité entre record affiché et historique. |
| A6 | `primaryValue` dénormalisé sur la session | Protège la (future) courbe d'un changement de métrique principale. |
| A7 | Auth storage platform-split | `expo-secure-store` casse le bundle web ; `localStorage` casse le natif. |
| A8 | Métrique principale + conditions, pas de score composite | Seule règle honnête quand plusieurs champs coexistent. |
| A9 | Bonus de régularité isolé dans `model/consistency` | `record` reste lisible ; le bonus testable seul. |
| A10 | Feedback en table dédiée, lecture CLI-only | Récolte simple sans exposer les retours d'autrui côté client. |
| A11 | Responsive via hook + tokens de layout | Une bascule unique (`useResponsive`) plutôt que des breakpoints épars. |

---

## 8. Structure des dossiers (source de vérité)

```
app/
  (auth)/_layout.tsx · sign-in.tsx · sign-up.tsx
  onboarding.tsx
  (tabs)/_layout.tsx · index.tsx · profile.tsx · settings.tsx
  item/_layout.tsx · new.tsx · [id]/session.tsx · [id]/edit.tsx
  _layout.tsx
convex/
  schema.ts · validators.ts · auth.ts · auth.config.ts · http.ts
  items.ts · sessions.ts · players.ts · feedback.ts
  model/consistency.ts · model/player.ts
  _generated/**
src/
  components/**  constants/theme.ts  hooks/useResponsive.ts
  store/useUIStore.ts  utils/xp.utils.ts · format.ts  lib/convex.ts · authStorage.*
```

---

## 9. Performance — règles non négociables

1. `transform`/`opacity` uniquement dans les animations.
2. `FlashList` pour toute liste.
3. `React.memo` sur les composants réactifs répétés (cartes, radar).
4. Mémoïser les dérivés lourds (`useMemo` : niveaux, filtrage/tri de la liste).
5. Éviter les recalculs impurs au render (ex. date du jour calculée à l'import
   dans l'écran session).
