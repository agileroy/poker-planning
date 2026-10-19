## Why

Un consensus du premier coup est un petit succès d'équipe : le célébrer rend l'estimation plus conviviale.

## What Changes

- À la révélation, quand tout le monde a joué la même carte chiffrée (message « Consensus »), une courte pluie de confettis traverse l'écran de chaque participant.
- Pas de confettis à l'arrivée dans une salle déjà révélée, ni pour les personnes qui ont demandé à réduire les animations.
- Aucune bibliothèque : animation dessinée par le site.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `vote-results` : nouvelle exigence « Confettis en cas de consensus ».

## Impact

- Nouveau module `site/js/confetti.js`, `site/js/ui.js`, tests d'interface.
- Aucune modification des règles Firebase ni des données.
