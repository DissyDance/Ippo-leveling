# 🧩 Components — Ippo Leveling

> Inventaire des composants et écrans. Tous les visuels tirent leurs couleurs, typo
> et espacements de `src/constants/theme.ts` — aucune valeur en dur.

---

## 1. Composants atomiques (`src/components/`)

### `Txt`
Texte typé sur les tokens. `variant` = clé de `Typography` (`hero`, `h1`…`caption`,
`data`, `recordValue`), `color` par défaut `textPrimary`. **Tout texte passe par
`Txt`** — jamais de `<Text>` brut avec styles en dur.

### `Screen`
Conteneur d'écran : `SafeAreaView`, fond dark, largeur responsive. Téléphone →
colonne bornée `maxContentWidth` (560) centrée ; ordinateur (`useResponsive().isWide`)
→ pleine page avec `screenPaddingWide`. Prop `centered` pour centrer verticalement
(auth/onboarding).

### `Button`
Variantes `primary` (fond `primary`, texte `onPrimary`), `secondary` (surface +
bordure), `ghost`. États `disabled`/`loading` (spinner). Appui GPU-only
(`transform: scale`).

### `TextField`
Label (`Txt` variant `label`) + `TextInput` stylé sur les tokens. Props usuelles
(`keyboardType`, `secureTextEntry`, `autoCapitalize`…). Pour le multiline (feedback),
un `TextInput` dédié est utilisé dans l'écran réglages.

### `StatPill`
Pastille d'une caractéristique : bordure = couleur de la stat, remplie si
`selected`. `showLabel` affiche le libellé complet (« Force ») sinon le code
(« FOR »). Cliquable via `onPress` (filtres, multi-sélection).

### `RankBadge`
Badge du rang : fond = `RANK_CONFIG[rank].color`, texte = `onColor`. Lecture seule.

### `RadarChart` (`memo`)
Radar SVG des 6 caractéristiques (`react-native-svg`). Reçoit `levels: number[]`
(ordre de `STATS`). Anneaux de grille, axes + labels colorés par stat, aire de
données en `Colors.primary` (purple) à 22 % d'opacité, points par stat. Échelle
auto (`niceMax` arrondi au multiple de 5).

### `AuthCredentials`
Formulaire email/mot de passe partagé par `sign-in` et `sign-up`.

---

## 2. Composants composés

### `ItemCard` (`memo`) — `src/components/ItemCard.tsx`
Carte d'un item dans la liste Records. Contenu :
- Header : nom + `RankBadge` + bouton **« Modifier »** (Pressable séparé qui
  n'active pas le tap carte → navigue vers `item/[id]/edit`).
- Pastilles des caractéristiques ciblées.
- Bloc record : valeur principale en grand (`recordValue`, `primary`) + conditions
  (`formatConditions`), ou message « aucun record ».
- Footer : nombre de sessions + objectif en cours (`currentTarget`).

Props : `entry: { item, record }`, `onPress` (→ session), `onEdit` (→ edit).

---

## 3. Écrans (`app/`)

### `(auth)/sign-in.tsx` · `sign-up.tsx`
Auth Convex (Password + Google). Utilisent `AuthCredentials`.

### `onboarding.tsx`
Écran 2 de l'onboarding (profil : nom, taille, poids). Entièrement sautable →
`players.ensureProfile` sans argument crée quand même le joueur.

### `(tabs)/index.tsx` — Records
Liste `FlashList` des items actifs. Header : titre + « + Nouvel exercice », filtres
par caractéristique et par rang, tri cyclique (récence → rang → sessions). Rendu via
`ItemCard`. `onPress` → session, `onEdit` → édition.

### `(tabs)/profile.tsx`
Niveau global (`hero`, purple), `RadarChart`, niveau par caractéristique, total de
sessions, historique XP (`listRecentXpLogs`, 30 derniers). Dérivés mémoïsés.

### `(tabs)/settings.tsx`
Compte (nom affiché), **section Feedback** (textarea + envoi via `feedback.submit`,
message succès/erreur), déconnexion.

### `item/new.tsx` — Création
Nom, description, multi-sélection des caractéristiques, sélecteur de rang (XP
affichée en direct), activation des champs, désignation de la métrique principale +
direction, **objectif à atteindre** (optionnel). Prévisualisation d'XP via
`xpPerStat`. Responsive.

### `item/[id]/session.tsx` — Enregistrer une session
Date pré-remplie modifiable, un champ par champ activé, rappel du record actuel
au-dessus de la métrique principale, notes. À la validation : célébration si record,
récap XP + bonus régularité. (L'ancien champ « objectif prochaine fois » a été retiré
— l'objectif se fixe désormais à la création/édition de l'item.)

### `item/[id]/edit.tsx` — Édition
Même formulaire que la création, prérempli, appelle `items.update`. Inclut le champ
objectif. Responsive.

---

## 4. Hooks & state

### `useResponsive()` — `src/hooks/useResponsive.ts`
`{ width, isWide }` via `useWindowDimensions`. `isWide = width >= wideBreakpoint`
(768). Utilisé par `Screen` et les 3 écrans formulaires pour basculer colonne
bornée ↔ pleine page.

### `useUIStore` — `src/store/useUIStore.ts`
Zustand, state UI éphémère uniquement. Actuellement : visibilité de la célébration
de record. Rien de persistant ici.

---

## 5. Conventions de composants

- Un composant = un fichier `PascalCase.tsx` dans `src/components/`.
- Styles en bas de fichier via `StyleSheet.create()`.
- `memo` sur les composants rendus en liste ou sensibles au re-render Convex
  (`ItemCard`, `RadarChart`).
- Aucune couleur/taille en dur : `Colors`, `Typography`, `Spacing`, `Radius`.
- Accessibilité : `accessibilityRole="button"` sur les Pressable actionnables,
  `accessibilityLabel` sur les actions non textuelles.
