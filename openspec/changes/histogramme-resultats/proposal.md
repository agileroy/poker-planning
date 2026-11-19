## Why

Retour d'usage : la restitution des votes (pastilles « 4 × 2 · 2 × 3 », puis « Plus bas / Plus haut » avec les prénoms) n'est pas assez visuelle. On ne voit pas d'un coup d'œil si l'équipe est alignée ou dispersée, et la liste des prénoms encombre le récapitulatif.

## What Changes

- La répartition devient un histogramme : une colonne par cran de l'échelle, du plus petit au plus grand vote chiffré. Les crans non joués entre ces deux bornes s'affichent à 0 (trait plat), le reste de l'échelle n'est pas affiché. `?` et ciseaux, s'ils sont joués, suivent l'échelle après un séparateur.
- Le nombre de votes est écrit dans chaque barre ; la ou les cartes les plus jouées ressortent en couleur pleine.
- Un repère en pointillés « moyenne » situe la moyenne entre les colonnes, dès qu'il y a au moins deux crans.
- Les lignes « Plus bas / Plus haut » avec les prénoms disparaissent du récapitulatif. Les votes extrêmes restent calculés : mise en évidence des cartes dans la liste des présents et encadré « Écart important », inchangés.

## Capabilities

### Modified Capabilities

- `vote-results` : « Répartition des votes » devient un histogramme ; « Votes extrêmes » n'est plus listé dans les résultats.

## Impact

`site/js/poker-core.js` (`computeHistogram`), `site/js/room-ui.js`, `site/index.html`, `site/app.css`, `tests/poker-core.test.mjs`, `README.md`.
