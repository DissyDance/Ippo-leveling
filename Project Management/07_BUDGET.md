# 💰 Budget — Ippo Leveling

> V1 = usage personnel, mono-utilisateur, non publié. Objectif de coût : **0 €/mois**.

---

## 1. Coûts actuels — V1

| Poste | Offre | Coût |
|---|---|---|
| Backend + DB | Convex Free (1M function calls, 1 GB storage) | 0 € |
| Hébergement web | Vercel Hobby | 0 € |
| Auth | Convex Auth (inclus) | 0 € |
| Google OAuth | Google Cloud (quota gratuit) | 0 € |
| Build mobile | EAS Build (free tier, builds limités) | 0 € |
| **Total** | | **0 €/mois** |

---

## 2. Marge avant de payer

- **Convex Free** : 1M appels de fonctions / mois. Usage mono-utilisateur ≈ quelques
  centaines d'appels/jour au plus. Marge > 99 %.
- **Storage** : items + sessions + xpLogs = quelques Ko/enregistrement. Des milliers
  de sessions restent très en dessous de 1 GB.
- **Vercel Hobby** : bande passante largement suffisante pour un usage perso.

---

## 3. Contraintes de licence

- **Vercel Hobby interdit l'usage commercial.** Toute monétisation impose Vercel Pro
  (~20 $/mois) et vraisemblablement Convex Pro.
- Passage en publié (stores) → coûts Apple Developer (99 $/an) + Google Play (25 $
  one-time), hors périmètre V1.

---

## 4. Refus catégoriques

- Pas de service tiers payant tant que le Free tier suffit.
- Pas d'infra auto-hébergée à opérer (Convex gère le backend).
- Pas de monétisation en V1 (SPEC : gratuit, non publié).

---

## 5. Seuils de décision

| Déclencheur | Action |
|---|---|
| Dépassement récurrent du Free tier Convex | Évaluer Convex Pro (usage réel d'abord). |
| Passage multi-utilisateur / publication | Repenser licence Vercel + coûts stores. |
| Besoin de notifications push | Coût EAS/Expo Push à chiffrer (hors scope V1). |

---

## 6. Hypothèses

- Un seul utilisateur actif.
- Pas de contenu média lourd (assets statiques légers, pas d'upload).
- Trafic web négligeable.

Tant que ces hypothèses tiennent, le budget reste **0 €/mois**.
