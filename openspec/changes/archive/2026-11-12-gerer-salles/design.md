## Context

La roue de la chance gère déjà plusieurs équipes : liste à l'accueil, création, renommage, corbeille, noms uniques réservés dans une branche d'index (`teamNames`), routage par ancre (`#/`, `#/trash`, `#/team/<id>`), identifiants de 12 caractères `[a-z0-9]`. Ce changement reprend ces choix pour les salles du poker planning. La différence : une salle de poker contient surtout un état éphémère (présents, votes, tour), alors qu'une équipe de la roue contient des données durables (membres).

## Goals / Non-Goals

**Goals:**
- Une salle par équipe, indépendante des autres (présents, pseudos, votes, révélation, réglage de révélation automatique).
- Même ergonomie et mêmes règles de nommage que la roue de la chance.
- Les règles de la base imposent, salle par salle, les contraintes actuelles, plus l'unicité des noms et la fermeture des salles de la corbeille.

**Non-Goals:**
- Salles privées, mot de passe, animateur désigné.
- Reprise des données de l'ancienne salle unique (uniquement éphémères).

## Decisions

- **Modèle de données** : `rooms/<id>` porte `name`, `createdAt`, `deletedAt` (corbeille) et, comme l'ancienne branche `room`, `state`, `votes`, `participants`, `settings`, `pseudos`. `roomNames/<clé du nom>` réserve le nom (même mécanisme que `teamNames`). Une seule arborescence par salle garde les règles existantes presque inchangées (le chemin `room/` devient `rooms/$roomId/`).
- **Lecture** : l'accueil s'abonne à `rooms` (une équipe = quelques présents et votes : volume négligeable) pour afficher le nombre de présents de chaque salle. Une salle ne s'abonne qu'à `rooms/<id>` ; le renommage lit `rooms` une fois pour vérifier le nom, et la base refuse de toute façon un nom déjà réservé.
- **Salle ouverte = salle d'une page** : passer d'une salle à la liste, ou à une autre salle, recharge la page après avoir quitté la salle. Toute la logique de présence (connexions, `onDisconnect`, minuteurs d'inactivité, décompte) reste propre à un chargement et ne peut pas fuir d'une salle à l'autre. Alternative écartée : démonter et remonter l'interface de salle dans la même page (nombreux abonnements et minuteurs à arrêter, risque de présence fantôme).
- **Revenir à la liste = quitter** : présence, vote non révélé et pseudo libérés, comme le bouton « Quitter ». Sinon le participant resterait affiché comme présent d'une salle qu'il ne regarde plus.
- **Corbeille** : la mise à la corbeille écrit `deletedAt` et efface `state`, `votes`, `participants` et `pseudos` en une seule écriture : les participants voient la salle se fermer, et une salle restaurée repart propre. `name`, `createdAt` et `settings` sont gardés : restaurée, la salle garde son nom, son adresse (donc les liens et QR codes déjà partagés) et son réglage. Les règles refusent toute arrivée, tout vote et tout réglage dans une salle de la corbeille, et la suppression définitive d'une salle qui n'y est pas.
- **Clé des noms** : la clé de la roue (`nameKey` : casse, accents et espaces ignorés). La clé des pseudos reste inchangée (casse et espaces de bord seulement) pour ne pas changer la règle des pseudos.
- **Pseudo et rôle mémorisés pour toutes les salles** : une personne garde son pseudo d'une salle à l'autre ; l'unicité reste vérifiée dans chaque salle.
- **Routes** : `#/` liste, `#/trash` corbeille, `#/room/<id>` salle, comme la roue. L'adresse sans ancre ouvre la liste.

## Risks / Trade-offs

- [Lien ou QR code de l'ancienne salle unique] → il ouvre la liste des salles : un clic de plus, une seule fois.
- [Salle mise à la corbeille pendant un vote] → confirmation qui rappelle le nombre de présents ; restauration possible à l'identique, sauf le vote en cours.
- [Écriture malveillante d'un index de nom] → comme dans la roue, la base exige que la réservation pointe vers une salle existante ; un utilisateur connecté peut toutefois libérer un nom. Accepté pour un outil d'équipe sans compte.
- [Rechargement au changement de salle] → bref écran « Connexion… » ; accepté pour la robustesse de la présence.

## Migration Plan

Au push sur `main`, le job `rules` publie les nouvelles règles puis le site : l'ancienne branche `room` devient illisible. Ses données (présents et votes d'un instant) peuvent être effacées dans la console Firebase. Créer ensuite une salle par équipe.

## Open Questions

_Aucune._
