## Context

La fiche `participants/{uid}` contient `pseudo`, `connections` et `lastActive`. La vue (`buildRoomView`) compte les votants parmi les présents.

## Decisions

- **Donnée** : booléen `participants/{uid}/observer`, écrit par le participant lui-même (`database.rules.json` : `.validate` booléen). Absent = votant, pour rester compatible avec les fiches existantes.
- **Mémorisation** : `localStorage` (`poker-planning.role`), réappliqué par `enter()` à l'arrivée.
- **Vue** : `buildRoomView` ajoute `observer` à chaque participant, ignore le vote d'un observateur (`hasVoted` faux, `vote` nul), et renvoie `voterCount` (présents qui votent) et `observerCount` ; `canReveal` reste « au moins un vote ». Le libellé du compteur est calculé par une fonction pure `voteCountLabel(view)`.
- **Passage en observateur** : écriture de `observer: true` puis retrait du vote (refusé par les règles après révélation, sans effet puisqu'un vote d'observateur n'est pas compté).
- **Interface** : sélecteur à deux options (`role="radiogroup"`) au-dessus du jeu de cartes ; pour un observateur, le jeu de cartes est remplacé par un message.

## Risks / Trade-offs

- [Règles non republiées] → L'écriture de `observer` est refusée par les anciennes règles (`$other: false`) : le choix reste local et le participant compte encore comme votant. À republier avec la mise en production.
