## Why

Après essai, l'ambiance casino néon (`ambiance-casino-neon`, puis `mode-clair-neon`) en fait trop pour l'équipe. On revient à la présentation sobre d'avant.

## What Changes

- Retour à l'interface d'avant `ambiance-casino-neon` (commit ace1a6a) : palette verte claire et sombre, police système, présents en liste simple, médiane seule (sans machine à sous), histogramme à barres, « Consensus : 3 ».
- Suppression des polices embarquées (`site/fonts/`) et des libellés `lowLabel` / `highLabel` de `computeResults`, devenus inutiles.
- Conservé : le choix du thème clair ou sombre, déjà rétabli par `mode-clair-neon`.

## Capabilities

### Modified Capabilities

- `site-publication` : « Interface et appareils » revient à son texte d'avant (thème clair et sombre, sans ambiance néon).
- `vote-results` : « Médiane des cartes chiffrées », « Consensus » et « Présentation des messages à discuter » reviennent à leur texte d'avant.

## Impact

`site/` (`index.html`, `app.css`, `js/poker-core.js`, `js/room-ui.js`, suppression de `fonts/`), `tests/poker-core.test.mjs`, `README.md` : identiques à ace1a6a.
