# 📘 Runbook — Ippo Leveling

> Procédures opérationnelles : setup, dev, déploiement, inspection, incidents.

---

## 0. Coordonnées de déploiement

| Ressource | Valeur |
|---|---|
| Repo GitHub | `DissyDance/Ippo-leveling` (branche `main`) |
| Convex projet | `miguel-grilo:ippo-leveling` |
| Convex prod (deployment) | `benevolent-alligator-346` (eu-west-1) |
| Convex prod URL | `https://benevolent-alligator-346.eu-west-1.convex.cloud` |
| Convex dashboard | `https://dashboard.convex.dev/t/miguel-grilo/ippo-leveling/benevolent-alligator-346` |
| Web | Vercel (Hobby), auto-deploy sur push `main` |
| Build web | `npm run build:web` → `expo export -p web` → `dist/` |

---

## 1. Setup initial (première installation)

```bash
npm install                 # .npmrc : legacy-peer-deps=true

# Convex (première fois : login + lier au projet ippo-leveling)
npx convex dev              # crée/lie le déploiement de dev, laisser ouvert

# Variables d'env Convex (dashboard) :
#   AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET
#   + variables Convex Auth (JWT/JWKS/SITE_URL)

# Expo (2e terminal)
npm start
```

⚠️ Ne pas créer de `babel.config.js` (casse expo-router en SDK 56).
⚠️ `convex/auth.config.ts` doit déclarer `process` en ambient sinon `convex deploy`
échoue en silence.

---

## 2. Commandes essentielles

```bash
# Dev
npx convex dev            # terminal 1 (laisser ouvert)
npm start                 # terminal 2 ; i / a / w

# Qualité (à faire passer avant tout commit)
npm run type-check
npm run lint
npm test

# Déploiement
git push origin main      # web (Vercel auto)
npx convex deploy -y      # backend PRODUCTION
```

---

## 3. Déploiement — procédure « push et deploy » (Prod)

> Convention utilisateur : « push et deploy » signifie **toujours Prod**.

1. Vérifier la qualité : `npm run type-check && npm run lint && npm test`.
2. Commit sur `main` (workflow solo direct sur `main`).
3. `git push origin main` → déclenche le build Vercel (`build:web` → `dist/`).
4. `npx convex deploy -y` → pousse schéma + fonctions sur `benevolent-alligator-346`
   (production).
5. Vérifier : logs `convex deploy` (« Deployed Convex functions… », indexes
   ajoutés/aucun supprimé) + build Vercel côté dashboard.

`convex deploy` regénère aussi les bindings TypeScript et refuse de supprimer un
index encore utilisé.

---

## 4. Déploiement mobile (EAS)

Les builds natifs iOS/Android passent par **EAS Build** (non couvert par le push
web). Tout changement d'**assets d'icône/splash** nécessite un rebuild natif pour
être visible sur device — le web prend les nouveaux assets au prochain build Vercel.

---

## 5. Inspection des données

- **Dashboard Convex** (lien §0) : tables, documents, logs de fonctions.
- **Feedback joueurs** (CLI, internal) :
  ```bash
  npx convex run feedback:listAll --prod
  npx convex run feedback:remove '{"id":"<_id>"}' --prod
  ```

---

## 6. Reset / données de test

Mono-utilisateur. Pour repartir propre : supprimer manuellement les documents via le
dashboard Convex (tables `items`, `sessions`, `xpLogs`, `players`). Aucune mutation
destructive n'est exposée côté app (ledgers append-only).

---

## 7. Checklist pré-déploiement production

- [ ] `type-check` OK
- [ ] `lint` OK
- [ ] `test` OK (dont `isBetter` sur `lower_better`)
- [ ] Pas de couleur en dur introduite (tout via `theme.ts`)
- [ ] Pas de `babel.config.js` ajouté
- [ ] Schéma : changement additif, aucun index encore utilisé supprimé
- [ ] `git push origin main` puis `npx convex deploy -y`

---

## 8. Troubleshooting

| Symptôme | Cause probable | Fix |
|---|---|---|
| `convex deploy` semble OK mais fonctions non à jour | `auth.config.ts` sans `declare const process` | Ajouter la déclaration ambient. |
| Bundle web casse : `getValueWithKeyAsync is not a function` | `expo-secure-store` importé côté web | Passer par `src/lib/authStorage.*` (split web/natif). |
| expo-router ne route plus | présence d'un `babel.config.js` | Le supprimer ; alias via `metro.config.js`. |
| Record `lower_better` incohérent | régression sur `isBetter` | Vérifier le test dédié ; `xp.utils.ts` seule source. |
| Radar/liste re-render en boucle | `memo` retiré | Restaurer `React.memo` sur `ItemCard`/`RadarChart`. |
| Nouvelle icône absente sur téléphone | build natif non refait | Rebuild EAS. |

---

## 9. Incident critique en production

1. Identifier la couche : web (Vercel) vs backend (Convex).
2. **Backend** : consulter les logs de fonctions dans le dashboard Convex ; au
   besoin redéployer une version connue-bonne (`git checkout <sha>` puis
   `npx convex deploy -y`).
3. **Web** : rollback via le dashboard Vercel (redeploy d'un build précédent).
4. Les données sont préservées (ledgers append-only) — aucun recalcul rétroactif à
   craindre.
