## Why

Une fois les cartes révélées, l'action suivante est « Nouveau vote », mais ce bouton reste discret (contour seul) alors que « Révéler », devenu inutile, garde la couleur pleine. Sur téléphone, il est en plus tout en bas, sous la liste des présents : il faut faire défiler pour relancer un tour.

## What Changes

- Le bouton mis en valeur suit l'étape : « Révéler » en couleur pleine pendant le vote ; après la révélation, « Révéler » s'efface et « Nouveau vote » passe en couleur pleine, avec une icône ↻ et un halo pendant quelques secondes.
- Après la révélation, la zone « Votre carte » (cartes figées ou message d'observateur) est remplacée par un grand bouton « Nouveau vote », avec le rappel « Votes figés · discutez, puis relancez ».

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `voting-round` : nouvelle exigence « Mise en valeur de l'étape suivante ».

## Impact

- `site/index.html`, `site/app.css`, `site/js/ui.js`, tests d'interface. Aucune modification des règles Firebase ni des données.
