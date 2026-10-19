## Why

Une carte « ? » veut dire qu'un participant n'a pas assez compris la story pour l'estimer. Aujourd'hui, elle n'apparaît que dans la répartition (« 1 × ? ») : l'équipe doit chercher qui l'a jouée, et la question passe facilement à la trappe.

## What Changes

- Après la révélation, si au moins un participant a joué « ? », les résultats affichent qui l'a joué et invitent à clarifier la story avec lui (par exemple « Julie et Paul ont joué « ? » : prenez le temps de clarifier la story avec eux. »).

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `vote-results` : nouvelle exigence « Questions (carte ?) ».

## Impact

- `site/js/poker-core.js` (pseudos ayant joué « ? », message), `site/js/ui.js`, `site/index.html`, `site/app.css`, tests.
- Aucune modification des règles Firebase ni des données.
