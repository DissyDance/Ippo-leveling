# 🚩 Features — Ippo Leveling (livré / abandonné)

> État réel des fonctionnalités. Ippo n'a **pas** de table `appSettings` ni de flags
> runtime : le périmètre est piloté par les lots (L0…L3) et le code déployé. Ce
> document tient lieu de registre livré + changelog.

---

## 1. Features livrées

### L0 — Socle ✅
- Repo, Convex, Convex Auth (Password + Google).
- Auth gate (`app/_layout.tsx`) : non-auth → auth, auth sans joueur → onboarding,
  auth + joueur → tabs.
- Onboarding 2 écrans (auth + profil sautable).
- Design system `theme.ts`, validators partagés `validators.ts`.
- Navigation par tabs.
- `xp.utils.ts` + tests unitaires (dont `isBetter` sur les deux directions).
- Déploiement Vercel (web) sur push `main`.

### L1 — Boucle jouable ✅
- CRUD items (`items.create` / `items.update`, écrans `new` / `edit`).
- Enregistrement de session (`sessions.record`, écran `session`).
- Calcul + répartition d'XP à parts égales, bonus record ×1.5.
- Détection du record personnel (pointeur `personalRecordSessionId`).
- Bonus de régularité hebdomadaire sur VOL (`model/consistency`).
- Liste des Records (`(tabs)/index`) avec filtres + tri.
- Profil avec radar des 6 caractéristiques + historique XP.

### Ajouts récents (hors lots) ✅
- **Édition d'item** : bouton « Modifier » par carte + écran `item/[id]/edit`.
- **Objectif à atteindre** fixé à la création ET à l'édition (`currentTarget`) ;
  suppression du champ « objectif prochaine fois » de l'écran session.
- **Layout responsive** : desktop pleine page / mobile colonne bornée
  (`useResponsive`, tokens `wideBreakpoint` / `screenPaddingWide`).
- **Section Feedback** dans les réglages (`convex/feedback.ts` + table `feedback`).
- **Rebrand purple** : tokens `gold*` → `primary*` (`#A855F7`), bordures, +
  recolorisation des assets (icône, splash, favicon, adaptive Android).

---

## 2. En cours / à finir

### L2 — Historique & détail 🟡
| Élément | État |
|---|---|
| Édition d'item avec validation des invariants | ✅ |
| Écran détail `item/[id]` | ⏳ non implémenté |
| Historique des sessions (liste par date) | ⏳ (`sessions.listByItem` existe déjà côté backend) |
| Courbe de progression SVG du record | ⏳ |
| Promotion manuelle du record (`items.promoteRecord`) | ⏳ mutation non encore écrite |

### L3 — Confort ⏳
Chrono intégré, export des données, recherche, archivage d'items (`status:
'archived'` déjà prévu au schéma, pas encore d'UI).

---

## 3. Features explicitement abandonnées (SPEC v1 → v2)

Modules Quêtes et Ascension, catalogue boxe fourni, circuits chronométrés, quêtes
récurrentes, objectifs sportifs datés. Hors scope V2 : multi-user, social,
classements, partage, notifications push, offline persistant, monétisation,
calibration au poids de corps, génération de contenu par LLM, tout score composite
pondéré.

---

## 4. Changelog

| Date | Changement |
|---|---|
| 2026-08 (L0) | Socle : Expo SDK 56 + Convex Auth. |
| 2026-08 (L1) | Boucle jouable : items, sessions, XP, record, radar. |
| 2026-08-18 | Édition d'item + objectif à la création/édition ; retrait objectif de la session. |
| 2026-08-18 | Layout responsive (desktop/mobile). |
| 2026-08-18 | Section feedback (settings + backend + table). |
| 2026-08-18 | Rebrand purple : design tokens + assets icône/splash/favicon/Android. |

> Ippo n'a pas encore de constante `CHANGELOG` in-app (contrairement à Leveling
> MASTER). À introduire si un écran « Nouveautés » est ajouté (voir `10_ROADMAP`).
