## Why

Après la révélation, la pratique du poker planning veut que les deux votes les plus éloignés s'expliquent en premier : c'est ce qui lance la discussion. Aujourd'hui, il faut chercher dans la liste qui a mis la carte la plus basse et la plus haute.

## What Changes

- Après la révélation, les résultats affichent le vote le plus bas et le vote le plus haut parmi les cartes chiffrées, avec les pseudos de ceux qui les ont joués (par exemple « Plus bas : 1 — Julie · Plus haut : 8 — Marc, Léa »).
- Rien n'est affiché quand il n'y a pas au moins deux valeurs chiffrées différentes (consensus, un seul votant, ou seulement `?` et ciseaux).
- Dans la liste des présents, les cartes extrêmes sont mises en évidence.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `vote-results` : nouvelle exigence « Votes extrêmes ».

## Impact

- `site/js/poker-core.js` (calcul des extrêmes), `site/js/ui.js`, `site/index.html`, `site/app.css`, tests.
- Aucune modification des règles Firebase ni des données stockées.
