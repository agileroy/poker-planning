## Context

Les résultats sont calculés par `computeResults` (valeurs seules) dans `poker-core.js` ; la vue `buildRoomView` connaît les pseudos des votants présents.

## Decisions

- Nouvelle fonction pure `computeExtremes(voters)` dans `poker-core.js`, à partir de `[{ pseudo, vote }]` : renvoie `null` s'il y a moins de deux valeurs chiffrées différentes, sinon `{ low: { value, pseudos }, high: { value, pseudos } }` avec pseudos triés (`localeCompare` français). `buildRoomView` l'ajoute aux résultats (`results.extremes`) et marque chaque participant (`extreme: 'low' | 'high' | null`).
- Affichage : une ligne « Plus bas / Plus haut » dans le panneau Résultats, sous la répartition ; mini-carte du participant soulignée (bordure épaisse et pastille ↓ / ↑) avec un libellé accessible.

## Risks / Trade-offs

- [Beaucoup de votants sur une même valeur extrême] → La liste de pseudos passe à la ligne ; acceptable pour une équipe.
