# 🥊 Ippo Leveling

> Suivi de performance sportive gamifié. Crée tes exercices, enregistre tes
> sessions, bats tes records, fais monter six caractéristiques RPG.

3ᵉ app de la franchise **Leveling** (FlashCard Leveling → mémorisation, Leveling
MASTER → productivité, **Ippo Leveling → sport**). Même grammaire de progression,
domaine différent.

---

## Vision

Toute la valeur tient dans une boucle courte, sans friction :

```
créer un item  →  enregistrer une session  →  gagner de l'XP  →  battre son record
        ▲                                                              │
        └──────────────────────────────────────────────────────────────┘
```

Pas de quêtes, pas de catalogue imposé, pas de conseils. Le joueur définit tout.

---

## Stack technique

| Couche | Techno | Version |
|---|---|---|
| Framework | React Native + Expo | SDK 56 |
| Langage | TypeScript strict | 6.x |
| Navigation | Expo Router (file-based) | v6 |
| Backend + DB | Convex | 1.39+ |
| Auth | Convex Auth (Password + Google) | 0.0.92 |
| State UI | Zustand | 5 |
| Animations | Reanimated + Worklets + Gesture Handler | 4 |
| Listes | @shopify/flash-list | 2 |
| SVG (radar) | react-native-svg | 15 |
| Tests | Jest + ts-jest | 29 |
| Web | Vercel (Hobby), auto-deploy sur `main` | — |
| Mobile | EAS Build | — |

---

## Démarrage rapide

```bash
# 1. Installer
npm install                 # .npmrc force legacy-peer-deps=true

# 2. Convex (première fois : lier au projet ippo-leveling)
npx convex dev              # laisser tourner (terminal 1)

# 3. Expo (terminal 2)
npm start                   # puis i / a / w
```

Env Convex à définir côté dashboard : `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, et
les variables d'auth (JWT/JWKS/SITE_URL) via `@convex-dev/auth`.

---

## Concepts clés

- **Item** — un exercice défini par le joueur. Mutable. Porte nom, caractéristiques
  ciblées, rang, champs mesurés, métrique principale + direction, objectif en cours.
- **Session** — une tentative datée sur un item. **Append-only.**
- **Record personnel** — pas un objet : le champ `items.personalRecordSessionId`
  pointe vers une session.
- **Caractéristiques (6)** — VIT, END, FOR, AGI, TEC, VOL. Fixes.
- **Champs mesurables (4)** — chrono (s, lower_better), reps, rounds, load (kg).
- **Métrique principale** — le seul champ comparé pour un record ; les autres sont
  des conditions affichées mais jamais comparées.
- **Rangs (9)** — E → SS+, chacun avec une XP de base (10 → 2000).
- **XP** — répartie à parts égales entre les caractéristiques de l'item, ×1.5 sur
  un record. Bonus de régularité hebdomadaire sur la Volonté.

---

## Structure du projet

```
app/
├── (auth)/            sign-in · sign-up
├── onboarding.tsx     profil (nom, taille, poids) — sautable
├── (tabs)/            index (Records) · profile · settings
├── item/
│   ├── new.tsx        création
│   └── [id]/          session · edit
└── _layout.tsx        providers + auth gate
convex/                schema · items · sessions · players · feedback · auth · http
  ├── validators.ts    tokens partagés
  └── model/           consistency · player (helpers)
src/
├── components/        Screen · Txt · Button · TextField · StatPill · RankBadge
│                      RadarChart · ItemCard · AuthCredentials
├── constants/theme.ts design system (source unique)
├── hooks/             useResponsive
├── store/             useUIStore
├── utils/             xp.utils · format
└── lib/               convex · authStorage (platform-split)
```

---

## Documentation

Répertoire `Project Management/` :

| Fichier | Contenu |
|---|---|
| `00_AGENT_GUIDE` | Onboarding contributeur |
| `01_README` | Ce fichier |
| `02_ARCHITECTURE` | Couches, flux, ADR |
| `03_DATABASE` | Schéma, indexes, mutations |
| `04_COMPONENTS` | Inventaire UI |
| `05_FEATURE_FLAGS` | Features livrées / abandonnées |
| `06_RUNBOOK` | Setup, déploiement, troubleshooting |
| `07_BUDGET` | Coûts |
| `08_CHARTE_GRAPHIQUE` | Design system |
| `10_ROADMAP` | Backlog |
| `SPEC.md` | Spécification de référence (v2.0) |

---

## Direction artistique

« Ceinture de champion ». Dark mode exclusif. Accent **purple** (`#A855F7`), rouge
sang en secondaire (alertes). Typo : Bebas Neue (titres), Inter (UI), JetBrains
Mono (chiffres). Détails dans `08_CHARTE_GRAPHIQUE`.

---

## Principes non négociables

1. Pas de perte d'XP. Progression toujours positive.
2. Mobile-first.
3. Dark mode exclusif.
4. TypeScript strict, zéro `any`.
5. Animations GPU-only.
6. Convex = source de vérité des données.
7. 60 fps sur milieu de gamme.
8. `sessions`/`xpLogs` append-only.
9. Le record est un pointeur.
10. Aucun conseil médical/nutritionnel.

---

## Statut du projet

- **L0 — Socle** ✅ livré (auth, onboarding, theme, navigation, xp.utils + tests, déploiement).
- **L1 — Boucle jouable** ✅ livré (CRUD items, sessions, XP, records, radar profil).
- **L2 — Historique & détail** 🟡 partiel (édition d'item ✅ ; écran détail, courbe SVG, promotion manuelle du record, historique des sessions ⏳).
- **L3 — Confort** ⏳ à venir (chrono, export, recherche, archivage).

Ajouts récents hors lots : objectif fixé à la création/édition, layout responsive
(desktop pleine page / mobile), section feedback dans les réglages, rebrand purple
(UI + assets). Détail dans `05_FEATURE_FLAGS` et `10_ROADMAP`.
