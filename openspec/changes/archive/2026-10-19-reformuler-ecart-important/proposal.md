## Why

Le titre « 4 crans d'écart entre… » met l'accent sur un chiffre. L'auteur veut insister sur la différence de compréhension de la story, pour lancer la discussion sans compter les points. Les deux questions, collées sur une même ligne, se mélangent aussi selon la largeur de l'écran.

## What Changes

- Nouveau titre : « Julie (1) et Marc (8) ne voient pas la story de la même façon ». Le nombre de crans n'est plus affiché (il reste le critère de déclenchement : au moins 2 crans).
- Les deux questions restent identiques, mais chacune sur sa propre ligne, quelle que soit la largeur de l'écran.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `vote-results` : exigence « Écart important » modifiée (titre et mise en ligne des questions).

## Impact

- `site/js/poker-core.js` (`gapMessage`), `site/index.html`, `site/js/ui.js`, tests.
