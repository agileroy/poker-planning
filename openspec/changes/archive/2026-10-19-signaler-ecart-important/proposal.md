## Why

Quand les estimations les plus basse et la plus haute sont très éloignées, les participants n'ont pas la même compréhension de la story. Le plus utile est alors de les faire parler ensemble : pourquoi l'un la trouve plus simple, pourquoi l'autre la trouve plus compliquée.

## What Changes

- Les « crans » suivent l'échelle des cartes chiffrées : 0 → 1 → 2 → 3 → 5 → 8.
- Après la révélation, si le vote le plus bas et le plus haut ont au moins 2 crans d'écart (par exemple 1 et 3), les résultats affichent un encadré qui nomme les deux camps et leur pose la question : « 2 crans d'écart entre Julie (1) et Marc (3) — Julie, qu'est-ce qui te paraît plus simple ? Marc, qu'est-ce qui te paraît plus compliqué ? »
- Un seul cran d'écart (par exemple 3 et 5) ne déclenche rien.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `vote-results` : nouvelle exigence « Écart important ».

## Impact

- `site/js/poker-core.js` (crans, écart, message), `site/js/ui.js`, `site/index.html`, `site/app.css`, tests.
- Aucune modification des règles Firebase ni des données.
