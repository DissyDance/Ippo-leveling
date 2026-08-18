# 🗺️ Roadmap & Backlog — Ippo Leveling

> Ce qui reste à faire, priorisé. L0 et L1 sont livrés (voir `05_FEATURE_FLAGS`).

---

## 1. L2 — Historique & détail (prochaine priorité)

| Item | Description | État |
|---|---|---|
| Écran détail `item/[id]` | Toutes les infos de l'item, éditables sur place, point d'entrée vers l'historique et la courbe. | ⏳ |
| Historique des sessions | Liste par date décroissante : valeur principale, conditions, XP gagnée. Backend `sessions.listByItem` déjà prêt. | ⏳ |
| Courbe de progression SVG | Record dans le temps, en `react-native-svg`. Un `lower_better` (chrono) doit monter visuellement vers le mieux. **Écran à plus forte valeur perçue.** | ⏳ |
| `items.promoteRecord` | Promotion manuelle d'une session en record : repointe `personalRecordSessionId`, ne crédite aucune XP, ne modifie aucune session. | ⏳ |

**DoD L2** : la courbe affiche correctement une progression `lower_better` ;
promouvoir une ancienne session recalcule l'affichage sans toucher à l'XP créditée.

---

## 2. L3 — Confort

| Item | Description |
|---|---|
| Chrono intégré | Remplir le champ `chrono` via un chronomètre in-app. |
| Export des données | Téléchargement JSON du profil, items, sessions. |
| Recherche | Filtrer les items par nom. |
| Archivage d'items | UI pour `status: 'archived'` (déjà au schéma), masquer sans supprimer. |

---

## 3. Backlog / idées V2+

- Écran « Nouveautés » + constante `CHANGELOG` in-app (à l'image de Leveling MASTER).
- Séquence de célébration record enrichie (Reanimated) — le hook `useUIStore`
  (`celebrationVisible`) est déjà en place.
- Statistiques agrégées par caractéristique (index `xpLogs.by_user_stat` déjà prêt).
- Série de régularité affichée sur le profil (au-delà du bonus).
- Objectifs par caractéristique / suggestions de prochain rang.

---

## 4. Hors scope (rappel)

Multi-user, social, classements, partage, notifications push, offline persistant,
monétisation, catalogue d'exercices fourni, calibration au poids de corps, circuits
chronométrés, quêtes récurrentes, génération de contenu par LLM, score composite
pondéré. Toute réouverture passe par un ADR dans `SPEC.md`.

---

## 5. Dette technique / vigilance

- Pas de tests au-delà de `xp.utils` — étendre aux mutations critiques (`record`,
  `create/update`, `consistency`) quand L2 se stabilise.
- `items.by_user_rank` et `xpLogs.by_user_stat` sont créés mais pas encore
  exploités — les brancher (tri/stats) ou documenter leur usage futur.
- Introduire un écran « Nouveautés » nécessitera de formaliser le changelog
  (actuellement dans `05_FEATURE_FLAGS`).
