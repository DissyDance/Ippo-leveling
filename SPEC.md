# SPEC — Ippo Leveling

> Spécification technique de référence. Source de vérité produit et technique.
> Toute décision contredisant ce document doit faire l'objet d'un ADR.
>
> **Version :** 2.0 · **Date :** août 2026 · **Statut :** validée, prête pour exécution
>
> La v1.0 décrivait deux modules (Quêtes et Ascension), un catalogue boxe et des
> circuits chronométrés. Ce périmètre est abandonné. La v2.0 le remplace intégralement.

---

## 1. Vision et périmètre

### 1.1 Pitch

Application de suivi de performance sportive gamifiée. Le joueur crée ses propres exercices,
enregistre des sessions, bat ses records personnels et fait progresser six caractéristiques
de type RPG.

3ᵉ app de la franchise Leveling, après FlashCard Leveling (mémorisation) et Leveling MASTER
(productivité). Même grammaire de progression, domaine différent.

### 1.2 Un seul module : Record

Il n'y a pas d'autre module. Toute la valeur tient dans une boucle courte :

```
créer un item  →  enregistrer une session  →  gagner de l'XP  →  battre son record
                            ▲                                            │
                            └────────────────────────────────────────────┘
```

### 1.3 Cible V1

Usage personnel, mono-utilisateur, gratuit, non publié en store. Auth activée dès le départ
pour la synchronisation multi-device et pour ne pas avoir à migrer le schéma plus tard.

### 1.4 Plateformes

| Plateforme | Périmètre |
|---|---|
| iOS / Android | Cible prioritaire, développement React Native |
| Web (Vercel) | Parité complète, aucune exception |

### 1.5 Hors scope V1

Multi-user, social, classements, partage, notifications push, mode hors ligne persistant,
monétisation, catalogue d'exercices fourni, calibration au poids de corps, circuits
chronométrés, quêtes récurrentes, objectifs sportifs datés, génération de contenu par LLM.

---

## 2. Principes non négociables

1. **Pas de perte d'XP.** La progression est toujours positive. Aucune pénalité rétroactive.
2. **Mobile-first.** L'expérience mobile prime en cas d'arbitrage.
3. **Dark mode exclusif.**
4. **TypeScript strict, zéro `any`.**
5. **Animations GPU-only** : `transform` et `opacity` uniquement.
6. **Convex est la source de vérité des données.** Le schéma TypeScript fait autorité.
7. **60 fps sur device milieu de gamme.**
8. **`sessions` est un ledger append-only.** Jamais d'UPDATE, jamais de DELETE.
9. **Le record personnel n'est pas une donnée, c'est un pointeur** vers une session.
10. **Aucun conseil médical, nutritionnel ou de perte de poids.**

---

## 3. Stack technique

| Couche | Technologie | Version cible |
|---|---|---|
| Framework | React Native + Expo | SDK 56 |
| Langage | TypeScript strict | 5.x |
| Navigation | Expo Router (file-based) | v6 |
| Backend et base de données | Convex | 1.39+ |
| Auth | Convex Auth (Password + Google) | 0.0.92+ |
| State UI | Zustand | 5 |
| Animations | Reanimated + react-native-worklets + Gesture Handler | 4 |
| Listes | @shopify/flash-list | 2 |
| SVG (radar, courbes, badges) | react-native-svg | 15 |
| Tests | Jest + ts-jest | 29 |
| Hébergement web | Vercel (Hobby), auto-deploy sur `main` | — |
| Build mobile | EAS Build | — |
| Repo | `Ippo-Leveling`, GitHub privé | — |

### 3.1 Pièges connus, hérités du projet précédent sur la même stack

- **Ne pas créer de `babel.config.js`.** Sa présence casse `expo-router` en SDK 56.
  Les alias passent par `metro.config.js`.
- **`convex/auth.config.ts`** doit déclarer `process` en ambient
  (`declare const process: { env: ... }`), sinon `npx convex deploy` échoue en silence
  et les fonctions ne se mettent pas à jour.
- **Storage d'auth platform-split** : `localStorage` sur web, `expo-secure-store` sur natif.
  Un code path unique qui importe `SecureStore` côté web casse le bundle
  (`getValueWithKeyAsync is not a function`).
- **`.npmrc`** avec `legacy-peer-deps=true`.
- **Validators Convex partagés** dans `convex/validators.ts`. Une stat, un rang ou un champ
  se déclare à un seul endroit, jamais en `v.union(...)` recopié inline.
- **Réactivité Convex** : `useQuery` re-render à chaque mutation pertinente. Mémoïser
  agressivement (`React.memo`) sur le dashboard où six stats peuvent re-render ensemble.

### 3.2 Coût V1

Convex Free (1M function calls, 1 GB storage) et Vercel Hobby : **0 €/mois**.
Vercel Hobby interdit l'usage commercial. Toute monétisation impose le passage en Pro.

---

## 4. Modèle de domaine

### 4.1 Les deux objets

| Objet | Définition | Mutable |
|---|---|---|
| **Item** | Un exercice défini par le joueur. Porte le nom, les caractéristiques ciblées, le rang, et la configuration des champs mesurés. | Oui |
| **Session** | Une tentative datée sur un item, avec les valeurs mesurées et l'objectif pour la prochaine fois. | **Non, append-only** |

Le record personnel n'est pas un troisième objet. C'est un champ `personalRecordSessionId`
sur l'item, qui pointe vers une session. Une seule source de vérité, aucun risque de
désynchronisation entre le record affiché et l'historique.

### 4.2 Les six caractéristiques

| Caractéristique | Code | Domaine |
|---|---|---|
| Vitesse | `VIT` | Explosivité, vélocité gestuelle |
| Endurance | `END` | Capacité aérobie et anaérobie |
| Force | `FOR` | Production de force maximale |
| Agilité | `AGI` | Coordination, déplacement, réactivité |
| Technique | `TEC` | Maîtrise gestuelle et précision |
| Volonté | `VOL` | Régularité, discipline, effort ingrat |

Fixes, non extensibles par le joueur. Le radar et le niveau global perdent leur sens sinon.

### 4.3 Champs mesurables d'un item

Quatre champs optionnels, activables indépendamment à la création :

| Champ | Clé | Unité | Direction naturelle |
|---|---|---|---|
| Chrono | `chrono` | secondes | `lower_better` |
| Répétitions | `reps` | rep | `higher_better` |
| Rounds | `rounds` | round | `higher_better` |
| Charge | `load` | kg | `higher_better` |

Au moins un champ doit être activé. Un item sans champ mesurable n'a pas de record et n'a
donc pas sa place dans ce module.

### 4.4 Métrique principale et conditions (décision structurante)

Un item peut activer plusieurs champs. Le record ne peut alors plus être un chiffre unique :
20 répétitions à vide et 15 répétitions à 20 kg ne sont pas comparables sans règle.

**Règle retenue, en trois pièces :**

1. **Une métrique principale est désignée à la création**, parmi les champs activés, avec sa
   direction. C'est le seul champ comparé pour déterminer un record.
2. **Les autres champs sont des conditions.** Ils sont enregistrés et affichés partout où le
   record apparaît, mais jamais comparés. Le PR s'affiche `15 reps · 20 kg`, jamais `15`.
3. **Une action « définir comme record » existe dans l'historique.** Un clic promeut n'importe
   quelle session en record personnel. Cela couvre tous les cas ambigus pour un coût dérisoire.

Aucun score composite pondéré. Une formule inventée serait impossible à calibrer honnêtement
et ferait perdre confiance dans les chiffres affichés.

### 4.5 Comparateur

```ts
export const isBetter = (
  value: number,
  best: number | undefined,
  direction: Direction,
): boolean => {
  if (best === undefined) return true
  return direction === 'higher_better' ? value > best : value < best
}
```

Le cas `lower_better` doit être couvert par un test unitaire explicite. C'est l'erreur la plus
probable de tout le projet.

---

## 5. Schéma Convex

Fichier autoritaire : `convex/schema.ts`. Validators partagés : `convex/validators.ts`.

### 5.1 `players`

```ts
players: defineTable({
  userId: v.id('users'),

  displayName: v.optional(v.string()),
  heightCm: v.optional(v.number()),      // informatif, aucune logique métier
  weightKg: v.optional(v.number()),      // informatif, aucune logique métier

  vit_xp: v.number(),
  end_xp: v.number(),
  for_xp: v.number(),
  agi_xp: v.number(),
  tec_xp: v.number(),
  vol_xp: v.number(),

  createdAt: v.number(),
}).index('by_user', ['userId'])
```

Taille et poids sont purement déclaratifs et facultatifs. Aucun calcul n'en dépend, aucun
objectif de poids n'est proposé, aucun message à connotation santé n'est affiché.

### 5.2 `items`

```ts
items: defineTable({
  userId: v.id('users'),

  name: v.string(),
  description: v.optional(v.string()),
  statTargets: v.array(STAT),            // 1 à 6, non vide
  rank: RANK,                            // E → SS+

  enabledFields: v.array(FIELD_KEY),     // sous-ensemble non vide de chrono|reps|rounds|load
  primaryMetric: FIELD_KEY,              // doit appartenir à enabledFields
  direction: DIRECTION,

  personalRecordSessionId: v.optional(v.id('sessions')),
  currentTarget: v.optional(v.number()), // objectif en cours, en unité de primaryMetric
  sessionCount: v.number(),
  lastSessionAt: v.optional(v.number()),

  status: v.union(v.literal('active'), v.literal('archived')),
  createdAt: v.number(),
}).index('by_user_status', ['userId', 'status'])
  .index('by_user_rank', ['userId', 'rank'])
```

**Invariants à valider côté mutation :**
- `statTargets.length >= 1`
- `enabledFields.length >= 1`
- `enabledFields.includes(primaryMetric)`
- Retirer un champ de `enabledFields` alors qu'il est `primaryMetric` est refusé.

### 5.3 `sessions`

Ledger append-only. Aucune mutation d'UPDATE ni de DELETE n'est exposée sur cette table.

```ts
sessions: defineTable({
  userId: v.id('users'),
  itemId: v.id('items'),

  performedAt: v.number(),               // pré-rempli au jour courant, modifiable

  values: v.object({                     // seuls les champs activés sont renseignés
    chrono: v.optional(v.number()),
    reps: v.optional(v.number()),
    rounds: v.optional(v.number()),
    load: v.optional(v.number()),
  }),

  primaryValue: v.number(),              // dénormalisé depuis values[primaryMetric]
  nextTarget: v.optional(v.number()),    // objectif que le joueur se fixe
  notes: v.optional(v.string()),

  xpGained: v.number(),
  isPersonalRecord: v.boolean(),

  createdAt: v.number(),
}).index('by_item_date', ['itemId', 'performedAt'])
  .index('by_user_date', ['userId', 'performedAt'])
```

`primaryValue` est dénormalisé volontairement : sans lui, la courbe de progression devrait
lire `values[item.primaryMetric]` à chaque point, et casserait si la métrique principale
changeait un jour.

### 5.4 `xpLogs`

Trace de tout crédit d'XP, par caractéristique. Append-only. Alimente l'historique de
progression du profil.

```ts
xpLogs: defineTable({
  userId: v.id('users'),
  sessionId: v.optional(v.id('sessions')),
  kind: v.union(v.literal('session'), v.literal('consistency')),
  stat: STAT,
  amount: v.number(),
  label: v.string(),
  loggedAt: v.number(),
}).index('by_user_date', ['userId', 'loggedAt'])
  .index('by_user_stat', ['userId', 'stat'])
```

---

## 6. Système de progression

### 6.1 Rangs et barème XP

Neuf rangs.

| Rang | Libellé | XP de base |
|---|---|---|
| E | Trivial | 10 |
| D | Simple | 25 |
| C | Moyen | 50 |
| B | Difficile | 100 |
| A | Haut niveau | 200 |
| S | Élite | 400 |
| S+ | Élite supérieur | 700 |
| SS | Exceptionnel | 1 200 |
| SS+ | Légendaire | 2 000 |

### 6.2 Répartition de l'XP sur plusieurs caractéristiques

L'XP du rang est **répartie à parts égales** entre les caractéristiques ciblées par l'item.

```
xpParStat = round( RANK_XP[rank] × multiplicateurRecord / statTargets.length )
```

Un item de rang B ciblant Force, Endurance et Volonté crédite 33 XP à chacune, pas 100 à
chacune. Sans cette règle, taguer tous ses items sur six caractéristiques serait la stratégie
optimale, et l'échelle de rang perdrait tout sens.

### 6.3 Bonus record

```
multiplicateurRecord = 1.5   si la session bat le record personnel, sinon 1.0
```

C'est le moteur de rétention principal. Le joueur revient pour battre son propre chiffre.

### 6.4 Bonus de régularité

Avec la suppression des quêtes récurrentes, la Volonté n'a plus de source automatique.
Un bonus hebdomadaire la réalimente.

| Sessions enregistrées dans la semaine glissante | Bonus `VOL` |
|---|---|
| 3 | 50 |
| 5 | 150 |
| 7 | 300 |

Crédité une seule fois par palier et par semaine, à l'enregistrement de la session qui
franchit le seuil. Tracé en `xpLogs` avec `kind: 'consistency'`. Jamais de retrait.

### 6.5 Courbe de niveau

Identique à la franchise :

```
XP_requis(n) = 77 × (n - 1)^1.5      // niveau 1 = 0 XP
```

Implémentation dans `src/utils/xp.utils.ts`, fonctions pures, importées **à la fois** côté
client (prévisualisation) et côté Convex (autorité). Un seul fichier, deux consommateurs,
jamais de copie.

### 6.6 Niveau global

```ts
globalLevel = levelFromXP(totalXP / 6)   // moyenne des six caractéristiques
```

Récompense l'équilibre, pas la spécialisation.

---

## 7. Mutations Convex

### 7.1 `items.create` / `items.update`

Valide les invariants du §5.2. `items.update` ne touche jamais aux sessions existantes.
Changer le rang d'un item **n'a aucun effet rétroactif** sur l'XP déjà créditée : le ledger
est immuable.

### 7.2 `sessions.record`

Mutation centrale. Convex garantit l'atomicité de tout le handler.

```ts
export const record = mutation({
  args: { itemId: v.id('items'), values: SESSION_VALUES, performedAt: v.number(),
          nextTarget: v.optional(v.number()), notes: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Non authentifié')

    const item = await ctx.db.get(args.itemId)
    if (!item || item.userId !== userId) throw new Error('Item introuvable')

    const primaryValue = args.values[item.primaryMetric]
    if (primaryValue === undefined) throw new Error('Métrique principale manquante')

    const best = item.personalRecordSessionId
      ? await ctx.db.get(item.personalRecordSessionId)
      : null
    const isPR = isBetter(primaryValue, best?.primaryValue, item.direction)

    const totalXp = RANK_XP[item.rank] * (isPR ? 1.5 : 1)
    const xpPerStat = Math.round(totalXp / item.statTargets.length)

    const sessionId = await ctx.db.insert('sessions', { ...args, userId, primaryValue,
      xpGained: xpPerStat * item.statTargets.length, isPersonalRecord: isPR, createdAt: Date.now() })

    const player = await getPlayer(ctx, userId)
    const patch: Record<string, number> = {}
    for (const stat of item.statTargets) {
      const key = STAT_CONFIG[stat].xpKey
      patch[key] = player[key] + xpPerStat
      await ctx.db.insert('xpLogs', { userId, sessionId, kind: 'session',
        stat, amount: xpPerStat, label: item.name, loggedAt: Date.now() })
    }
    await ctx.db.patch(player._id, patch)

    await ctx.db.patch(item._id, {
      sessionCount: item.sessionCount + 1,
      lastSessionAt: args.performedAt,
      currentTarget: args.nextTarget ?? item.currentTarget,
      ...(isPR ? { personalRecordSessionId: sessionId } : {}),
    })

    const consistency = await applyConsistencyBonus(ctx, userId)

    return { sessionId, isPersonalRecord: isPR, xpPerStat,
             stats: item.statTargets, consistency, levelBefore, levelAfter }
  },
})
```

### 7.3 `items.promoteRecord`

Promeut manuellement une session en record personnel. Ne crédite aucune XP, ne modifie
aucune session, se contente de repointer `personalRecordSessionId`.

---

## 8. Écrans

```
app/
├── (auth)/sign-in.tsx · sign-up.tsx
├── (onboarding)/index.tsx
├── (tabs)/
│   ├── index.tsx          Records — liste des items
│   ├── profile.tsx        Radar, niveau global, historique XP
│   └── settings.tsx
├── item/new.tsx           Création
├── item/[id].tsx          Détail, historique, courbe, édition
├── item/[id]/session.tsx  Enregistrer une session
└── _layout.tsx            Providers + Convex + auth gate
```

### 8.1 Liste des records

Carte par item : nom, badge de rang coloré, pastilles des caractéristiques ciblées, record
personnel affiché en grand avec ses conditions, objectif en cours. Bouton d'accès rapide à
l'enregistrement d'une session. Filtres par caractéristique et par rang, tri par récence,
rang ou nombre de sessions. `FlashList`, jamais `FlatList`.

### 8.2 Création d'un item

Nom, description optionnelle, multi-sélection des caractéristiques, sélecteur de rang avec
l'XP correspondante affichée en direct, cases d'activation des quatre champs, puis
désignation de la métrique principale et de sa direction parmi les champs cochés.

La désignation de la métrique principale doit être expliquée en une phrase dans l'écran.
C'est le concept le moins évident de l'app.

### 8.3 Enregistrer une session

Date pré-remplie au jour courant, modifiable. Un champ de saisie par champ activé sur l'item.
Le record actuel est rappelé en permanence au-dessus de la métrique principale. Champ
d'objectif pour la prochaine fois, pré-rempli avec `currentTarget`. Notes optionnelles.

À la validation : animation de célébration si record battu, puis récapitulatif de l'XP gagnée
par caractéristique et du bonus de régularité éventuel.

### 8.4 Détail de l'item

Toutes les informations, éditables sur place. Courbe de progression du record dans le temps,
en `react-native-svg`, avec les records marqués. Historique complet des sessions par date
décroissante, chaque ligne affichant valeur principale, conditions, XP gagnée, et une action
« définir comme record ».

La courbe de progression est l'écran à plus forte valeur perçue de l'application.

### 8.5 Profil

Radar des six caractéristiques, niveau global, niveau par caractéristique, total de sessions,
série de régularité en cours, historique des gains d'XP.

---

## 9. Onboarding

Deux écrans seulement.

| # | Écran | Champs | Obligatoire |
|---|---|---|---|
| 1 | Authentification | Email + mot de passe, ou Google | Oui |
| 2 | Profil | Nom affiché, taille, poids | Non, entièrement sautable |

Aucun objectif de poids, aucune recommandation, aucun message à connotation santé.

---

## 10. Conventions de code

| Élément | Convention | Exemple |
|---|---|---|
| Composants | `PascalCase` | `ItemCard.tsx` |
| Hooks | `use` + `camelCase` | `usePlayer` |
| Stores Zustand | `use` + `Store` | `useUIStore` |
| Queries Convex | `camelCase` | `listActiveItems` |
| Mutations Convex | verbe `camelCase` | `recordSession`, `promoteRecord` |
| Constantes | `SCREAMING_SNAKE_CASE` | `RANK_XP`, `STAT_CONFIG` |
| Utils | `kebab-case` | `xp.utils.ts`, `record.utils.ts` |

`type` plutôt que `interface` pour les données métier. `satisfies` sur les objets constants.
`StyleSheet.create()` obligatoire, inline réservé aux valeurs dynamiques. Aucune couleur en
dur dans le JSX : tout passe par `src/constants/theme.ts`. `transform: scaleX()` jamais
`width` animé. Zustand réservé au state UI éphémère (toasts, modales, séquence de
célébration) : tout ce qui persiste va dans Convex.

---

## 11. Découpage en lots

### L0 — Socle
Repo, Convex, Convex Auth, auth gate, onboarding 2 écrans, `theme.ts`, `validators.ts`,
navigation par tabs vides, `xp.utils.ts` avec ses tests, déploiement Vercel.

**Definition of Done :** l'app démarre sur iOS, Android et web. Un compte se crée, le profil
persiste, la déconnexion rend les tabs inaccessibles. `npm run type-check`, `npm run lint` et
`npm test` passent. Le push sur `main` déploie sur Vercel.

### L1 — Boucle jouable
CRUD items, enregistrement de session, calcul et répartition d'XP, détection du record,
bonus de régularité, liste des records, radar du profil.

**DoD :** créer un item à plusieurs caractéristiques, enregistrer trois sessions, battre un
record, vérifier que l'XP est bien répartie à parts égales et multipliée par 1,5 sur le
record. Tests unitaires sur `isBetter` avec les deux directions, et sur la répartition d'XP.

### L2 — Historique et détail
Écran de détail, édition d'item avec validation des invariants, historique des sessions,
courbe de progression SVG, promotion manuelle du record.

**DoD :** la courbe affiche correctement une progression `lower_better` (un chrono qui
descend monte visuellement vers le mieux). Promouvoir une ancienne session recalcule
l'affichage sans toucher à l'XP déjà créditée.

### L3 — Confort
Chrono intégré pour remplir le champ, export des données, recherche, archivage d'items.

---

## 12. Décisions actées

| # | Décision | Justification |
|---|---|---|
| D1 | Un seul module, Record | Boucle courte, valeur maximale par unité de code |
| D2 | Métrique principale désignée + conditions non comparées | Seule règle honnête quand plusieurs champs coexistent |
| D3 | Promotion manuelle du record possible | Couvre tous les cas ambigus à coût dérisoire |
| D4 | XP répartie à parts égales entre caractéristiques | Sinon taguer six stats devient la stratégie optimale |
| D5 | Bonus de régularité hebdomadaire sur la Volonté | Seule mécanique récompensant le fait de revenir |
| D6 | 9 rangs, E à SS+ | Échelle demandée |
| D7 | Le record est un pointeur vers une session | Une seule source de vérité |
| D8 | `sessions` et `xpLogs` append-only | Historique immuable, aucun recalcul rétroactif |
| D9 | Changer le rang d'un item n'a aucun effet rétroactif | Le ledger fait foi |
| D10 | Taille et poids purement informatifs | Aucune responsabilité santé engagée |
| D11 | `primaryValue` dénormalisé sur la session | Protège la courbe d'un changement de métrique |

---

## 13. Risques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Comparateur cassé sur `lower_better` | Élevée | Élevé | Test unitaire dédié dès L0 |
| Concept de métrique principale mal compris à l'usage | Moyenne | Moyen | Explication d'une phrase dans l'écran de création |
| Divergence `xp.utils.ts` client / serveur | Moyenne | Élevé | Fichier unique importé des deux côtés, jamais recopié |
| Re-render en cascade du radar | Moyenne | Faible | `React.memo` sur les six segments |
| Free tier Convex dépassé | Faible | Faible | Usage mono-utilisateur, très loin des 1M calls |

---

## 14. Commandes

```bash
npx convex dev              # à laisser tourner en permanence
npm start
npm run ios
npm run android
npm run web

npm test
npm run type-check
npm run lint

npx convex deploy
git push origin main        # déclenche Vercel
```

---

**Dernière mise à jour :** août 2026 · SPEC v2.0
