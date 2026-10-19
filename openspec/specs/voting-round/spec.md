# Voting Round Specification

## Purpose
Déroulé d'un tour de vote : jeu de cartes, vote caché, changement de vote, révélation et nouveau vote. Couvre l'interface, `site/js/room-store.js` et les règles `state` / `votes` de `database.rules.json`.

## Requirements

### Requirement: Jeu de cartes
La salle SHALL proposer, dans cet ordre, les cartes `?`, `0`, `1`, `2`, `3`, `5`, `8` et une carte ciseaux, représentée par une image de ciseaux avec le texte alternatif « Ciseaux : story à découper ». Le jeu de cartes est fixe.

#### Scenario: Cartes proposées
- **GIVEN** un participant dans la salle, cartes non révélées
- **WHEN** la salle s'affiche
- **THEN** les huit cartes sont proposées dans l'ordre ?, 0, 1, 2, 3, 5, 8, ciseaux

### Requirement: Vote caché
Un participant SHALL voter en cliquant sur une carte ; sa carte SHALL apparaître sélectionnée pour lui. Tant que les cartes ne sont pas révélées, les autres participants MUST NOT voir la valeur de son vote : ils SHALL seulement voir qu'il a voté, par une carte de dos à côté de son pseudo dans la liste des présents. Un participant qui n'a pas voté SHALL apparaître sans carte.

#### Scenario: Vote d'un participant
- **GIVEN** Julie et Marc dans la salle, cartes non révélées
- **WHEN** Marc clique sur la carte 5
- **THEN** Marc voit sa carte 5 sélectionnée, et Julie voit une carte de dos à côté de « Marc », sans la valeur

### Requirement: Changement de vote avant la révélation
Tant que les cartes ne sont pas révélées, un participant SHALL pouvoir changer de vote en cliquant sur une autre carte, et retirer son vote en recliquant sur sa carte sélectionnée.

#### Scenario: Changement de vote
- **GIVEN** Marc qui a voté 5, cartes non révélées
- **WHEN** il clique sur 8
- **THEN** son vote devient 8, et les autres voient toujours une carte de dos

#### Scenario: Retrait du vote
- **GIVEN** Marc qui a voté 5, cartes non révélées
- **WHEN** il reclique sur 5
- **THEN** il n'a plus de vote, et la carte de dos disparaît chez les autres

### Requirement: Révélation
Un bouton « Révéler », accessible à tous les participants, SHALL retourner les cartes de tous les participants présents en même temps pour tout le monde. Il SHALL être désactivé tant qu'aucun participant présent n'a voté. Une fois les cartes révélées, les votes MUST être figés : aucun participant ne peut voter, changer ni retirer son vote, et les cartes du jeu SHALL apparaître désactivées. Ce blocage MUST être appliqué aussi par les règles de sécurité du service temps réel, pas seulement par l'interface.

#### Scenario: Révélation par un participant
- **GIVEN** Julie qui a voté 3 et Marc qui a voté 5
- **WHEN** Julie clique sur « Révéler »
- **THEN** Julie et Marc voient 3 à côté de « Julie » et 5 à côté de « Marc »

#### Scenario: Vote figé
- **GIVEN** des cartes révélées
- **WHEN** Marc clique sur la carte 8
- **THEN** son vote reste 5

#### Scenario: Aucun vote
- **GIVEN** une salle où personne n'a voté
- **WHEN** la salle s'affiche
- **THEN** le bouton « Révéler » est désactivé

### Requirement: Nouveau vote
Un bouton « Nouveau vote », accessible à tous les participants, SHALL remettre à zéro les votes de tous les participants et masquer à nouveau les cartes, pour tout le monde en même temps. Les votes du tour précédent MUST être effacés de la base, y compris ceux des participants absents, et aucun d'eux MUST NOT réapparaître dans le nouveau tour. Les cartes du jeu SHALL redevenir sélectionnables.

#### Scenario: Nouveau tour
- **GIVEN** des cartes révélées
- **WHEN** Marc clique sur « Nouveau vote »
- **THEN** tous les participants voient la liste sans aucune carte, et peuvent voter à nouveau

#### Scenario: Votes effacés
- **GIVEN** Julie qui a voté 3 puis rechargé sa page, cartes révélées
- **WHEN** Marc clique sur « Nouveau vote » et Julie revient dans la salle
- **THEN** Julie n'a aucune carte sélectionnée et apparaît sans vote

#### Scenario: Vote tardif de l'ancien tour
- **GIVEN** des cartes non révélées et Julie qui clique sur 5 au moment même où Marc clique sur « Nouveau vote »
- **WHEN** les deux écritures arrivent à la base
- **THEN** le nouveau tour démarre sans aucun vote, et Julie voit sa carte désélectionnée

### Requirement: Arrivées et départs pendant un tour
Un participant qui quitte la salle SHALL voir son vote retiré de la liste, des résultats et du décompte des votants. Un participant qui arrive pendant un tour non révélé SHALL pouvoir voter. Un participant qui arrive après la révélation SHALL voir les cartes révélées et attendre le prochain « Nouveau vote » pour voter.

#### Scenario: Départ avant la révélation
- **GIVEN** Julie qui a voté 3 et Léa qui a voté 8, cartes non révélées
- **WHEN** Léa ferme son onglet, puis Julie clique sur « Révéler »
- **THEN** seul le vote 3 de Julie apparaît dans les cartes et les résultats
