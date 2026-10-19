## ADDED Requirements

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
