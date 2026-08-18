# 🗄 Database — Ippo Leveling

> Fichier autoritaire : `convex/schema.ts`. Validators partagés :
> `convex/validators.ts`. Ce document résume et explique ; le schéma fait foi.

---

## 1. Vue d'ensemble

Cinq tables métier (+ les tables de Convex Auth via `authTables`) :

| Table | Rôle | Mutable |
|---|---|---|
| `players` | Profil + XP par caractéristique | Oui |
| `items` | Exercices définis par le joueur | Oui |
| `sessions` | Tentatives datées | **Non — append-only** |
| `xpLogs` | Trace de chaque crédit d'XP | **Non — append-only** |
| `feedback` | Retours joueurs | Insert only (lecture CLI) |

Les tables d'auth (`users`, `authAccounts`, `authSessions`, …) sont fournies par
`@convex-dev/auth` via `...authTables`.

---

## 2. Schéma (résumé)

### `players`
```ts
players: defineTable({
  userId: v.id('users'),
  displayName: v.optional(v.string()),
  heightCm: v.optional(v.number()),   // informatif
  weightKg: v.optional(v.number()),   // informatif
  vit_xp, end_xp, for_xp, agi_xp, tec_xp, vol_xp: v.number(),
  createdAt: v.number(),
}).index('by_user', ['userId'])
```
Taille/poids purement déclaratifs — aucune logique métier, aucun message santé.

### `items`
```ts
items: defineTable({
  userId, name, description?,
  statTargets: v.array(STAT),          // 1..6, non vide
  rank: RANK,                          // E..SS+
  enabledFields: v.array(FIELD_KEY),   // sous-ensemble non vide de chrono|reps|rounds|load
  primaryMetric: FIELD_KEY,            // ∈ enabledFields
  direction: DIRECTION,
  personalRecordSessionId?: v.id('sessions'),
  currentTarget?: v.number(),          // unité de primaryMetric
  sessionCount: v.number(),
  lastSessionAt?: v.number(),
  status: 'active' | 'archived',
  createdAt: v.number(),
})
  .index('by_user_status', ['userId','status'])
  .index('by_user_rank',   ['userId','rank'])
```

### `sessions` (append-only)
```ts
sessions: defineTable({
  userId, itemId,
  performedAt: v.number(),             // pré-rempli au jour courant
  values: SESSION_VALUES,              // seuls les champs activés
  primaryValue: v.number(),           // dénormalisé depuis values[primaryMetric]
  nextTarget?: v.number(),
  notes?: v.string(),
  xpGained: v.number(),
  isPersonalRecord: v.boolean(),
  createdAt: v.number(),
})
  .index('by_item_date', ['itemId','performedAt'])
  .index('by_user_date', ['userId','performedAt'])
```

### `xpLogs` (append-only)
```ts
xpLogs: defineTable({
  userId, sessionId?,
  kind: 'session' | 'consistency',
  stat: STAT, amount: v.number(),
  label: v.string(), loggedAt: v.number(),
})
  .index('by_user_date', ['userId','loggedAt'])
  .index('by_user_stat', ['userId','stat'])
```

### `feedback`
```ts
feedback: defineTable({
  userId, message: v.string(), createdAt: v.number(),
}).index('by_user', ['userId'])
```

---

## 3. Validators partagés (`convex/validators.ts`)

`STAT`, `RANK`, `FIELD_KEY`, `DIRECTION`, `SESSION_VALUES` — déclarés une seule
fois. Des alias de type (`_StatOk`, `_RankOk`, …) vérifient à la **compilation**
que chaque validator correspond exactement aux tokens de `src/constants/theme.ts`.
Si l'un dérive, `tsc --noEmit` échoue. Zéro coût au runtime.

---

## 4. Indexes — stratégie

| Index | Usage |
|---|---|
| `players.by_user` | Lookup du joueur courant (`getCurrentPlayer`, `ensureProfile`). |
| `items.by_user_status` | Liste des items actifs (`listActiveItems`). |
| `items.by_user_rank` | Filtrage/tri par rang (réservé usage futur). |
| `sessions.by_item_date` | Historique d'un item (`listByItem`, futur détail). |
| `sessions.by_user_date` | Fenêtre glissante du bonus de régularité. |
| `xpLogs.by_user_date` | Historique XP du profil ; détection paliers déjà crédités. |
| `xpLogs.by_user_stat` | Agrégats par caractéristique (usage futur). |
| `feedback.by_user` | Regroupement par joueur (lecture CLI). |

---

## 5. Règles métier — mutations critiques

### `items.create` / `items.update` (`convex/items.ts`)
Valident `validateItemShape` : ≥1 caractéristique, ≥1 champ activé, `primaryMetric ∈
enabledFields`. `update` ne patche que les champs fournis et **ne touche jamais aux
sessions** — changer le rang n'a aucun effet rétroactif sur l'XP créditée.

### `sessions.record` (`convex/sessions.ts`)
Handler atomique (voir `02_ARCHITECTURE §3`). Points clés :
- `primaryValue` requis, sinon rejet.
- `isPR = isBetter(primaryValue, best?.primaryValue, direction)`.
- XP répartie à parts égales, ×1.5 si record.
- Insert session + 1 `xpLogs` par caractéristique + patch `players` + patch `items`.
- `applyConsistencyBonus` en fin de handler.
- **Aucune mutation UPDATE/DELETE n'existe sur `sessions`/`xpLogs`.**

### `players.ensureProfile`
Idempotente : crée le joueur (XP à 0) s'il n'existe pas, sinon patch des champs de
profil fournis. Appelée par « Enregistrer » ET « Passer » de l'onboarding.

### `feedback.submit`
Public (auth requise). Trim, rejette vide, plafonne à 2000 caractères, insert.
`listAll` / `remove` sont **internal** (CLI uniquement).

---

## 6. Calculs dérivés (`src/utils/xp.utils.ts`)

Fonctions pures partagées client/serveur :
- `isBetter(value, best, direction)` — comparateur de record (2 directions).
- `xpPerStat(rank, statCount, isPR)` — `round(RANK_XP[rank] × (isPR?1.5:1) / statCount)`.
- `xpForLevel(n) = 77 × (n-1)^1.5`, `levelFromXp`, `levelProgress`.
- `globalLevelFromStats(statXps)` — niveau global = niveau de la moyenne des 6 stats.

---

## 7. Sécurité — règles d'accès

- Toute query/mutation lit `getAuthUserId(ctx)` ; sans user → `null`/erreur.
- Ownership systématique : `item.userId === userId` avant toute action.
- Les queries retournent `[]`/`null` si non authentifié (pas d'exception qui
  casserait le render).
- `feedback` : un joueur ne lit jamais le feedback d'un autre (lecture internal).

---

## 8. Migrations & volumétrie

- **Schéma additif** privilégié (ex. `feedback` et `currentTarget` ajoutés sans
  casser l'existant). `convex deploy` refuse de supprimer un index encore utilisé.
- **Volumétrie** : mono-utilisateur. Quelques dizaines d'items, quelques milliers de
  sessions/xpLogs au grand maximum. Très loin des limites du Free tier Convex
  (voir `07_BUDGET`).
