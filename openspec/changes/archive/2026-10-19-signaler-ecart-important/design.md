## Decisions

- `poker-core.js` : `NUMERIC_SCALE = ['0', '1', '2', '3', '5', '8']` (dérivée de `CARDS`), `stepsBetween(a, b)` (différence d'index), `computeGap(extremes)` → `{ steps, low, high }` si au moins 2 crans (`GAP_MIN_STEPS = 2`), sinon `null`. `buildRoomView` l'ajoute aux résultats (`results.gap`).
- Texte produit par une fonction pure `gapMessage(gap)` → `{ title, prompt }` (`Intl.ListFormat` français, « te » / « vous » selon le nombre de personnes), testée unitairement.
- Affichage : encadré sous « Plus bas / Plus haut », dans un style d'invitation (bordure d'accent), distinct des alertes. Les marques ↓ / ↑ déjà présentes dans la liste désignent les mêmes personnes.
