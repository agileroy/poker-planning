## Context

`room/state` n'accepte que deux transitions (révéler, tour suivant) : y ajouter l'option ferait échouer sa validation. La vue (`buildRoomView`) connaît déjà votants, observateurs et votes du tour.

## Decisions

- **Donnée** : `room/settings/autoReveal` (booléen), modifiable par tout participant authentifié (`.validate` booléen). Hors de `state`, l'option survit aux « Nouveau vote ».
- **Condition** : fonction pure `allVotersVoted(view)` dans `poker-core.js` : cartes non révélées, au moins un votant présent, et chaque votant présent a voté.
- **Décompte local, révélation idempotente** : chaque navigateur lance son propre décompte de 3 secondes quand la condition devient vraie, l'annule quand elle devient fausse, et à la fin écrit la révélation si la condition tient toujours. Plusieurs navigateurs peuvent révéler en même temps : l'écriture est identique et acceptée par les règles. Les décomptes ne sont décalés que de la latence réseau. Un changement de carte ne relance pas le décompte, puisque la condition reste vraie.
- **Interface** : case à cocher « Révélation automatique » sous « Révéler / Nouveau vote » ; décompte dans un bandeau du panneau des présents (`role="status"`).

## Risks / Trade-offs

- [Règles non republiées] → L'écriture de l'option est refusée : la case revient à décochée. À republier avec la mise en production.
- [Participant qui hésite] → 3 secondes pour retirer son vote ; un changement de carte reste possible jusqu'à la révélation.
