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

### Requirement: Mode observateur
Dans la salle, chaque participant SHALL pouvoir choisir entre « Je vote », le choix par défaut, et « J'observe ». Le choix SHALL être visible de tous en temps réel, mémorisé dans le navigateur et réappliqué au retour dans la salle. Changer de mode SHALL compter comme une activité. Un observateur MUST NOT voir de jeu de cartes : un message « Vous observez ce vote. » le remplace. Le vote d'un observateur MUST NOT être compté ni affiché ; passer en observateur SHALL retirer son vote du tour en cours, s'il n'est pas révélé. Dans la liste des présents, un observateur SHALL apparaître avec la mention « observateur » et sans emplacement de carte. Le compteur de votes SHALL ne compter que les participants qui votent (par exemple « 2 / 3 votes · 1 observateur »). Un observateur SHALL garder l'accès à « Révéler », « Nouveau vote », « Changer de pseudo » et « Quitter ».

#### Scenario: Passage en observateur
- **GIVEN** Julie, Marc et Léa dans la salle, Léa ayant voté 5, cartes non révélées
- **WHEN** Léa choisit « J'observe »
- **THEN** son jeu de cartes est remplacé par « Vous observez ce vote. », son vote est retiré, et les autres voient « Léa » avec la mention « observateur »

#### Scenario: Compteur sans les observateurs
- **GIVEN** Julie et Marc qui votent, Léa observatrice, Julie ayant voté
- **WHEN** la salle s'affiche
- **THEN** le compteur indique « 1 / 2 vote · 1 observateur »

#### Scenario: Observateur qui révèle
- **GIVEN** Léa observatrice, Julie et Marc ayant voté
- **WHEN** Léa clique sur « Révéler »
- **THEN** les cartes de Julie et de Marc sont révélées pour tout le monde

#### Scenario: Choix mémorisé
- **GIVEN** Léa observatrice qui recharge la page
- **WHEN** elle revient dans la salle
- **THEN** elle est toujours observatrice

### Requirement: Révélation automatique
La salle SHALL proposer une option « Révélation automatique », désactivée par défaut, commune à tous les participants et modifiable par chacun ; tout changement SHALL être visible de tous en temps réel et compter comme une activité. Quand l'option est active, que les cartes ne sont pas révélées et que tous les participants présents qui votent (hors observateurs) ont voté, la salle SHALL afficher chez chacun un décompte « Révélation dans 3… », « 2… », « 1… », puis révéler les cartes. Le décompte MUST être annulé si, avant sa fin, un votant présent n'a plus de vote (retrait de vote, arrivée d'un participant, passage d'un observateur en votant) ou si l'option est désactivée. Changer de carte pendant le décompte MUST NOT l'annuler. Le bouton « Révéler » SHALL rester disponible pendant le décompte.

#### Scenario: Révélation après le dernier vote
- **GIVEN** l'option active, Julie et Marc présents, Julie ayant voté
- **WHEN** Marc vote
- **THEN** « Révélation dans 3… » s'affiche chez Julie et chez Marc, puis les cartes sont révélées au bout de 3 secondes

#### Scenario: Annulation par retrait de vote
- **GIVEN** l'option active et un décompte en cours
- **WHEN** Marc reclique sur sa carte pour retirer son vote
- **THEN** le décompte disparaît et les cartes restent cachées

#### Scenario: Observateurs non attendus
- **GIVEN** l'option active, Julie et Marc qui votent, Léa observatrice
- **WHEN** Julie et Marc ont voté
- **THEN** le décompte démarre sans attendre Léa

#### Scenario: Option désactivée
- **GIVEN** l'option désactivée
- **WHEN** tous les votants ont voté
- **THEN** aucun décompte ne s'affiche et les cartes restent cachées jusqu'à un clic sur « Révéler »

### Requirement: Mise en valeur de l'étape suivante
Tant que les cartes ne sont pas révélées, « Révéler » SHALL être le bouton principal (couleur pleine) et « Nouveau vote » un bouton secondaire. Après la révélation, « Révéler » SHALL apparaître comme secondaire et désactivé, et « Nouveau vote » SHALL devenir le bouton principal, précédé d'une icône de relance ; il SHALL porter un halo pendant 4 secondes après la révélation, sauf quand le système demande de réduire les animations. Après la révélation, la zone « Votre carte » (jeu de cartes, ou message d'observateur) SHALL être remplacée par un grand bouton « Nouveau vote » précédé du rappel « Votes figés · discutez, puis relancez » ; elle SHALL réapparaître dès le tour suivant. Les deux boutons « Nouveau vote » SHALL avoir le même effet.

#### Scenario: Pendant le vote
- **GIVEN** des cartes non révélées
- **WHEN** la salle s'affiche
- **THEN** « Révéler » est en couleur pleine, « Nouveau vote » en contour, et le jeu de cartes est visible

#### Scenario: Après la révélation
- **GIVEN** des cartes non révélées
- **WHEN** quelqu'un clique sur « Révéler »
- **THEN** « Nouveau vote » passe en couleur pleine avec l'icône de relance et un halo, « Révéler » est désactivé, et la zone « Votre carte » affiche le rappel et le grand bouton « Nouveau vote »

#### Scenario: Relance depuis le grand bouton
- **GIVEN** des cartes révélées
- **WHEN** un participant clique sur le grand bouton « Nouveau vote »
- **THEN** un nouveau tour commence pour tous et le jeu de cartes réapparaît

### Requirement: Participants attendus
Tant que les cartes ne sont pas révélées, quand au moins 4 participants présents votent (hors observateurs), qu'au moins 75 % d'entre eux ont voté et que tous n'ont pas encore voté, la salle SHALL afficher sous la liste des présents, au-dessus de « Révéler », la ligne « En attente de » suivie des pseudos des votants sans vote, triés par ordre alphabétique (« En attente de Paul », « En attente de Léa et Paul »). La ligne MUST NOT s'afficher avec moins de 4 votants, sous 75 % de votes, quand tout le monde a voté, ni après la révélation. Les observateurs MUST NOT être attendus.

#### Scenario: Un retardataire sur cinq
- **GIVEN** cinq votants présents dont quatre ont voté, Paul non
- **WHEN** la salle s'affiche
- **THEN** la ligne « En attente de Paul » apparaît au-dessus de « Révéler »

#### Scenario: Seuil de 75 %
- **GIVEN** quatre votants présents dont trois ont voté (75 %), Paul non
- **WHEN** la salle s'affiche
- **THEN** la ligne « En attente de Paul » apparaît

#### Scenario: Sous le seuil
- **GIVEN** cinq votants présents dont trois ont voté (60 %)
- **WHEN** la salle s'affiche
- **THEN** aucune ligne d'attente n'apparaît

#### Scenario: Trop peu de votants
- **GIVEN** trois votants présents dont deux ont voté, et une observatrice
- **WHEN** la salle s'affiche
- **THEN** aucune ligne d'attente n'apparaît
