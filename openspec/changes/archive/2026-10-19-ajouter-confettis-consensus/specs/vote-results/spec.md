## ADDED Requirements

### Requirement: Confettis en cas de consensus
Quand les cartes sont révélées et que les résultats affichent un consensus, chaque participant présent dans la salle à ce moment SHALL voir une pluie de confettis d'au plus 3 secondes, aux couleurs du thème. Les confettis MUST NOT empêcher de cliquer sur la page, MUST NOT être annoncés par les lecteurs d'écran, et MUST NOT apparaître à l'arrivée dans une salle déjà révélée, en l'absence de consensus, ni quand le système demande de réduire les animations (`prefers-reduced-motion`).

#### Scenario: Consensus célébré
- **GIVEN** Julie et Marc ayant voté 3
- **WHEN** les cartes sont révélées
- **THEN** des confettis tombent chez Julie et chez Marc, puis disparaissent en moins de 3 secondes

#### Scenario: Pas de consensus
- **GIVEN** Julie ayant voté 3 et Marc 5
- **WHEN** les cartes sont révélées
- **THEN** aucun confetti n'apparaît

#### Scenario: Animations réduites
- **GIVEN** Marc dont le système demande de réduire les animations
- **WHEN** les cartes sont révélées sur un consensus
- **THEN** Marc voit le message de consensus, sans confettis
