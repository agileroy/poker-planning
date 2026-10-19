## Why

Le réseau de l'entreprise bloque l'outil : l'équipe vote depuis son téléphone. Sur un petit écran, il faut aujourd'hui faire défiler la liste des présents pour atteindre les cartes, et rien ne signale la révélation à qui a posé son téléphone pendant la discussion.

## What Changes

- Sur un écran étroit, le jeu de cartes passe en premier, puis les résultats une fois révélés, puis la liste des présents avec « Révéler » et « Nouveau vote ».
- À la révélation, le téléphone vibre brièvement, quand le navigateur le permet.
- Sur un écran large, la mise en page ne change pas.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `site-publication` : nouvelle exigence « Mise en page sur téléphone ».

## Impact

- `site/app.css` (ordre des blocs sur écran étroit), `site/js/ui.js` (vibration), tests d'interface.
- Aucune modification des règles Firebase ni des données.
