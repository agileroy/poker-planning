## Why

La moyenne convient mal au poker planning : sur l'échelle 0, 1, 2, 3, 5, 8, aux écarts irréguliers, elle donne des valeurs qui ne sont pas des cartes (« 2,3 », « 4,5 ») et un vote isolé la tire fortement (2, 2, 2, 2, 2, 8 → 3). La médiane reste sur les cartes jouées et n'est pas déplacée par un vote isolé ; l'écart, lui, reste signalé par l'histogramme et l'encadré « Écart important ».

## What Changes

- « Moyenne » devient « Médiane », calculée sur les seules cartes chiffrées.
- Nombre impair de votes, ou deux votes du milieu identiques : la médiane est une carte (« 2 »). Nombre pair avec deux votes du milieu différents : les deux cartes s'affichent (« 2 – 3 »), pour lancer la discussion plutôt qu'afficher une valeur qui n'existe pas.
- Le repère de l'histogramme devient « médiane » : sur la colonne de la carte, ou à mi-chemin entre les deux colonnes du milieu.

## Capabilities

### Modified Capabilities

- `vote-results` : « Moyenne des cartes chiffrées » devient « Médiane des cartes chiffrées » ; repère de l'histogramme.
- `site-publication` : libellé des chiffres des résultats.

## Impact

`site/js/poker-core.js` (`computeMedian`, `formatMedian`, `computeHistogram`), `site/js/room-ui.js`, `site/index.html`, `site/app.css`, `tests/poker-core.test.mjs`, `README.md`.
