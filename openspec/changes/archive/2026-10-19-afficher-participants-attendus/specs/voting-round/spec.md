## ADDED Requirements

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
