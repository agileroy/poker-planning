## Why

En fin de tour, il faut souvent demander à voix haute « qui n'a pas encore voté ? ». L'information est dans la liste, mais il faut la parcourir.

## What Changes

- Quand au moins 4 participants votent (hors observateurs) et qu'au moins 75 % d'entre eux ont voté, une ligne « En attente de Paul » (ou « En attente de Paul et Léa ») s'affiche sous la liste des présents, au-dessus de « Révéler ».
- Elle disparaît dès que tout le monde a voté ou que les cartes sont révélées.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `voting-round` : nouvelle exigence « Participants attendus ».

## Impact

- `site/js/poker-core.js` (`waitingFor`, `waitingMessage`), `site/index.html`, `site/app.css`, `site/js/ui.js`, tests. Aucune modification des règles Firebase.
