## Why

Un PO ou un Scrum Master qui anime l'estimation sans voter est aujourd'hui compté comme un votant : le compteur affiche « 3 / 4 votes » tant qu'il n'a pas voté, ce qui laisse croire qu'on attend quelqu'un.

## What Changes

- Chaque participant choisit, dans la salle, entre « Je vote » (par défaut) et « J'observe ». Le choix est mémorisé dans son navigateur.
- Un observateur n'a pas de jeu de cartes, n'est pas compté dans le compteur de votes, et apparaît dans la liste avec la mention « observateur ».
- Un observateur garde l'accès à « Révéler », « Nouveau vote », « Quitter » et « Changer de pseudo ».
- Passer en observateur retire son vote du tour en cours.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `voting-round` : nouvelle exigence « Mode observateur ».

## Impact

- `site/js/poker-core.js` (vue de la salle, compteur), `site/js/room-store.js`, `site/js/ui.js`, `site/index.html`, `site/app.css`, tests.
- `database.rules.json` : nouveau champ `observer` (booléen) dans la fiche du participant ; les règles doivent être republiées dans la console Firebase.
