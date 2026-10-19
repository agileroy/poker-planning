## ADDED Requirements

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
