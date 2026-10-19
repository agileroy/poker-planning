## Why

Quand tout le monde a voté, il faut encore que quelqu'un pense à cliquer sur « Révéler ». En réunion, cette attente casse le rythme, surtout quand chacun vote depuis son téléphone.

## What Changes

- Une option « Révélation automatique », partagée par toute la salle et modifiable par tous.
- Quand l'option est active et que tous les votants présents ont voté, un décompte de 3 secondes s'affiche chez tout le monde, puis les cartes sont révélées.
- Retirer son vote pendant le décompte l'annule ; une arrivée ou un passage en votant qui laisse quelqu'un sans vote l'annule aussi.
- Le bouton « Révéler » reste disponible à tout moment.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `voting-round` : nouvelle exigence « Révélation automatique ».

## Impact

- `site/js/poker-core.js` (condition « tout le monde a voté »), `site/js/room-store.js`, `site/js/ui.js`, `site/index.html`, `site/app.css`, tests.
- `database.rules.json` : nouveau nœud `room/settings/autoReveal` (booléen) ; règles à republier dans la console Firebase.
