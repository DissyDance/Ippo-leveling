# Agent Guide — Ippo Leveling

> Lecture obligatoire avant toute contribution. Ce document donne le contexte
> minimal pour agir sans casser les invariants. La source de vérité produit reste
> `SPEC.md` ; la source de vérité design reste `src/constants/theme.ts`.

---

## 1. Contexte projet en 30 secondes

Application de suivi de performance sportive gamifiée. 3ᵉ app de la franchise
Leveling (après FlashCard Leveling et Leveling MASTER). Le joueur crée ses propres
**exercices** (items), enregistre des **sessions**, bat ses **records personnels**
et fait progresser six **caractéristiques** RPG (VIT, END, FOR, AGI, TEC, VOL).

Un seul module : **Record**. Boucle courte :
`créer item → enregistrer session → gagner XP → battre son record`.

Usage personnel, mono-utilisateur, gratuit, non publié en store. Auth activée dès
le départ pour la synchro multi-device.

---

## 2. Structure critique — où tout se trouve

| Besoin | Emplacement |
|---|---|
| Écrans (routing file-based) | `app/` (Expo Router) |
| Backend, schéma, mutations/queries | `convex/` |
| Validators partagés (stat/rang/champ/direction) | `convex/validators.ts` |
| Logique XP pure (client + serveur) | `src/utils/xp.utils.ts` |
| Design tokens (couleurs, typo, spacing) | `src/constants/theme.ts` |
| Composants UI | `src/components/` |
| Hooks | `src/hooks/` |
| State UI éphémère | `src/store/useUIStore.ts` |
| Doc produit de référence | `Project Management/SPEC.md` |

---

## 3. Conventions de code — règles absolues

- **TypeScript strict, zéro `any`.**
- **Aucune couleur/taille en dur dans le JSX.** Tout passe par `theme.ts` via
  `Colors`, `Typography`, `Spacing`, `Radius`. Le composant `Txt` porte la typo.
- **`StyleSheet.create()` obligatoire.** Inline réservé aux valeurs dynamiques.
- **Animations GPU-only** : `transform` et `opacity` uniquement. Jamais `width`/
  `height`/`top`/`left` animés.
- **Une stat/rang/champ/direction se déclare UNE fois** dans `validators.ts`,
  jamais recopiée inline en `v.union(...)`.
- **La logique XP vit dans `xp.utils.ts`**, importée par le client ET par Convex.
  Jamais de copie (divergence = bug garanti). Imports relatifs dans ce fichier
  (Convex/esbuild ne connaît pas les alias `@/`).
- `type` plutôt que `interface` pour les données métier ; `satisfies` sur les
  objets constants.
- `React.memo` sur les composants du dashboard/profil (le radar re-render sur
  chaque mutation pertinente).

Nommage : composants `PascalCase`, hooks `useCamelCase`, stores `useXStore`,
queries/mutations Convex `camelCase`, constantes `SCREAMING_SNAKE_CASE`, utils
`kebab-case`.

---

## 4. Pattern canonique — enregistrer une session

`convex/sessions.ts` → `record` est la mutation centrale, atomique (Convex garantit
l'atomicité du handler). Séquence :

1. Auth + ownership de l'item.
2. Lit `values[primaryMetric]` → `primaryValue`. Rejette si absent.
3. Compare au record via `isBetter(primaryValue, best?.primaryValue, direction)`.
4. `xpPerStat = xpPerStat(rank, statTargets.length, isPR)` (×1.5 si record).
5. Insert `sessions` (append-only) + un `xpLogs` par caractéristique ciblée.
6. Patch `players` (XP par stat), patch `items` (compteur, `lastSessionAt`,
   `currentTarget`, `personalRecordSessionId` si record battu).
7. `applyConsistencyBonus` (bonus de régularité hebdo sur VOL).
8. Retourne le récap (record ?, xp/stat, stats, consistency, niveau avant/après).

Le client prévisualise l'XP avec **les mêmes fonctions** (`xp.utils.ts`) — jamais
de recalcul dupliqué.

---

## 5. Ce qu'on n'utilise JAMAIS ici

- `FlatList` → toujours `@shopify/flash-list`.
- `babel.config.js` → sa présence casse `expo-router` en SDK 56. Alias via
  `metro.config.js`.
- UPDATE/DELETE sur `sessions` ou `xpLogs` → ledgers append-only.
- Couleurs en dur → passe par `theme.ts`.
- Un token nommé `gold` → l'accent est **purple** (`Colors.primary`). Cf. §7.
- Conseils médicaux / nutritionnels / de perte de poids → interdits (SPEC §2.10).

---

## 6. Commandes essentielles

```bash
# Développement (2 terminaux)
npx convex dev            # terminal 1 — laisser ouvert
npm start                 # terminal 2 — Expo

# Qualité
npm run type-check        # tsc --noEmit
npm run lint              # expo lint
npm test                  # jest

# Déploiement (voir 06_RUNBOOK)
git push origin main      # → Vercel auto-deploy (web)
npx convex deploy -y      # → Convex PRODUCTION
```

> **Règle utilisateur :** « push et deploy » = déployer sur **Prod** :
> `git push origin main` **et** `npx convex deploy -y`.

---

## 7. Décisions déjà tranchées — ne pas rouvrir

- **Un seul module (Record).** Pas de quêtes, pas de catalogue, pas de circuits.
- **Métrique principale + conditions** : un seul champ comparé pour le record ; les
  autres sont des conditions affichées jamais comparées. Aucun score composite.
- **XP répartie à parts égales** entre les caractéristiques d'un item.
- **Record = pointeur** (`items.personalRecordSessionId`), pas une table.
- **`sessions`/`xpLogs` append-only** ; changer le rang d'un item n'a aucun effet
  rétroactif.
- **Couleur de marque = purple** (`#A855F7`). Rebrand appliqué (voir
  `08_CHARTE_GRAPHIQUE`). Les palettes catégorielles (rangs, stats) gardent leurs
  teintes distinctes.
- **Dark mode exclusif.**

---

## 8. Points de vigilance

- **`isBetter` sur `lower_better`** (chrono) : l'erreur la plus probable du projet.
  Couverte par test unitaire — ne jamais la retirer.
- **Divergence client/serveur** : toujours passer par `xp.utils.ts`.
- **`convex/auth.config.ts`** doit déclarer `process` en ambient, sinon
  `convex deploy` échoue en silence.
- **Auth storage platform-split** : `localStorage` (web) vs `expo-secure-store`
  (natif) — voir `src/lib/authStorage.*`.
- **Nouveaux assets d'icône** → build natif (EAS) requis pour les voir sur device.

---

## 9. Liens rapides

- `01_README` — vision, démarrage, structure
- `02_ARCHITECTURE` — couches, flux, ADR
- `03_DATABASE` — schéma, indexes, mutations
- `04_COMPONENTS` — inventaire UI
- `05_FEATURE_FLAGS` — features livrées / abandonnées
- `06_RUNBOOK` — setup, déploiement, troubleshooting
- `07_BUDGET` — coûts
- `08_CHARTE_GRAPHIQUE` — design system
- `10_ROADMAP` — backlog
- `SPEC.md` — spécification produit/technique de référence
