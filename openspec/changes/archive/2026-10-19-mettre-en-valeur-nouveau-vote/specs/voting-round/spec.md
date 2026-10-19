## ADDED Requirements

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
