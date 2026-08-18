# 🎨 Charte Graphique — Ippo Leveling

> Source de vérité : `src/constants/theme.ts`. Aucune couleur, taille de police ou
> durée d'animation ne doit être écrite en dur ailleurs. Ce document explique et
> illustre les tokens ; le fichier fait foi.

---

## 1. Direction artistique

« Ceinture de champion ». **Dark mode exclusif.** Accent **purple** primaire, rouge
sang (crimson) en secondaire pour les alertes. Interface sobre, chiffres mis en
avant (records, XP, niveaux).

> Rebrand appliqué le 2026-08-18 : l'ancien accent or/ambre (`gold*`) a été renommé
> et revalué en `primary*` purple. Voir §10.

---

## 2. Palette de couleurs (`Colors`)

### Surfaces
| Token | Valeur | Usage |
|---|---|---|
| `background` | `#050308` | Fond global (quasi noir violacé). |
| `surface` | `#0E0B14` | Cartes, panneaux. |
| `surfaceElevated` | `#171220` | États actifs, chips sélectionnées. |
| `surfaceOverlay` | `rgba(5,3,8,.82)` | Overlays. |

### Accents (marque)
| Token | Valeur | Usage |
|---|---|---|
| `primary` | `#A855F7` | Accent de marque : boutons, aire radar, valeurs record, actifs. |
| `primarySoft` | `#D0A6FF` | Accent doux : hints, objectifs. |
| `primaryDeep` | `#7C3AED` | Purple profond (variations). |
| `onPrimary` | `#FFFFFF` | Texte sur fond `primary`. |
| `crimson` | `#E5384F` | Secondaire / alertes. Il n'existe pas de token « warning ». |
| `crimsonSoft` / `crimsonDeep` | `#FF7A88` / `#A31F32` | Variantes crimson. |

### Texte
| Token | Valeur |
|---|---|
| `textPrimary` | `#F5F3F0` |
| `textSecondary` | `#A8A29B` |
| `textMuted` | `#6B665F` |
| `textDisabled` | `#443F3A` |
| `onCrimson` | `#FFFFFF` |

### Bordures (dérivées du purple)
| Token | Valeur |
|---|---|
| `border` | `rgba(168,85,247,.16)` |
| `borderStrong` | `rgba(168,85,247,.32)` |
| `borderNeutral` | `rgba(245,243,240,.08)` |

### Sémantique
`success #22C55E`, `danger #DC2626`, `info #38BDF8` (+ variantes `*Bg`).

---

## 3. Palettes catégorielles (non « marque »)

Ces échelles gardent des teintes **distinctes** volontairement — elles ne suivent
pas l'accent purple (les recolorer casserait la lisibilité par catégorie).

### Rangs (`RANK_CONFIG`, 9)
E `#64748B` · D `#34D399` · C `#38BDF8` · B `#A78BFA` · A `#F5A524` · S `#FB7233` ·
S+ `#FF5A3C` · SS `#E5384F` · SS+ `#FCE7A2`. Chaque rang porte `color`, `onColor`,
`xp`.

### Caractéristiques (`STAT_CONFIG`, 6)
VIT `#22D3EE` · END `#34D399` · FOR `#E5384F` · AGI `#A78BFA` · TEC `#F5A524` ·
VOL `#E5E7EB`. Chaque stat porte `label`, `color`, `xpKey`, `icon`.

> Note : A/TEC restent ambre et B/AGI restent violet — teintes catégorielles, pas
> l'accent de marque.

---

## 4. Typographie (`Fonts` / `Typography`)

Polices (chargées dans `app/_layout.tsx` via expo-font) :
- **Bebas Neue** (`display`) — titres et grandes valeurs.
- **Inter** (`ui` / `uiMedium` / `uiBold`) — texte d'interface.
- **JetBrains Mono** (`mono` / `monoBold`) — chiffres tabulaires (obligatoire dès
  qu'un nombre change en place).

Variantes : `hero`(44) · `h1`(32) · `h2`(24) · `h3`(18) · `bodyLarge`(17) ·
`body`(15) · `bodySmall`(13) · `label`(12) · `caption`(11) · `data`(14 mono) ·
`recordValue`(40 monoBold). Accès via `<Txt variant="…">`.

---

## 5. Espacements & layout

`Spacing` (px) : xxs 2 · xs 4 · sm 8 · md 12 · lg 16 · xl 24 · xxl 32 · xxxl 48.
`Radius` : sm 6 · md 10 · lg 14 · xl 20 · pill 999.
`Layout` : `screenPadding` 16 · `screenPaddingWide` 32 · `cardPadding` 16 ·
`tabBarHeight` 64 · `minTouchTarget` 48 · `maxContentWidth` 560 · `wideBreakpoint`
768.

**Responsive** : sous 768 px → colonne bornée 560 centrée (téléphone) ; au-delà →
pleine page avec padding large (ordinateur). Bascule via `useResponsive()`.

---

## 6. Motion (`Motion`)

Durées : `fast` 120 · `base` 240 · `slow` 400 · `celebration` 900. Easings
`standard` / `overshoot` / `decelerate`. `pressScale` 0.97 (appui boutons/cartes).

**Règle GPU-only** : `transform` et `opacity` uniquement. Jamais de `width`/`height`/
`top`/`left` animés.

---

## 7. Composants visuels clés

- **Bouton** : `primary` (fond purple, texte blanc), `secondary` (surface + bordure),
  `ghost`. Appui `scale`.
- **StatPill** : bordure = couleur de la stat, remplie si sélectionnée.
- **RankBadge** : fond = couleur du rang.
- **RadarChart** : grille en `border`, aire en `primary` @ 22 % d'opacité, points
  colorés par stat.
- **ItemCard** : record en `recordValue`/`primary`, objectif en `primarySoft`.

---

## 8. Règles & anti-patterns

- ❌ Couleur/hex en dur dans le JSX → ✅ token `Colors.*`.
- ❌ `<Text>` avec `fontSize` en dur → ✅ `<Txt variant>`.
- ❌ Réintroduire un token nommé `gold` → ✅ `primary*`.
- ❌ Animer `width` → ✅ `transform: scaleX`.
- ❌ Mode clair → l'app est dark exclusif.

---

## 9. Constantes de progression (dans `theme.ts`)

`XP_CURVE_FACTOR` 77 · `XP_CURVE_EXPONENT` 1.5 · `PERSONAL_RECORD_MULTIPLIER` 1.5 ·
`STAT_COUNT` 6 · `CONSISTENCY_TIERS` (3→50, 5→150, 7→300). Consommées par
`src/utils/xp.utils.ts`.

---

## 10. Icône de l'app (rebrand purple, 2026-08-18)

Style « blueprint » : chevron « A » clair sur fond dégradé + grille technique.
Origine bleue, **recolorisée en purple** par rotation de teinte (+25°, calée sur
`#A855F7`) ; le glyphe blanc du splash a été refill en purple (l'alpha préservé).

Assets (`assets/images/`) :
- `icon.png` (1024²) · `favicon.png` (48²) — hue-rotate.
- `android-icon-background.png` / `android-icon-foreground.png` (512²) — hue-rotate.
- `splash-icon.png` — glyphe refill purple.
- `android-icon-monochrome.png` — laissé (masque teinté par le système Android).

Fond splash/adaptive : `#050308` (dans `app.json`). Un rebuild natif (EAS) est
requis pour voir la nouvelle icône sur device.
