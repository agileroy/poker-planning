## MODIFIED Requirements

### Requirement: Répartition des votes
La répartition SHALL s'afficher sous forme d'histogramme, sans pseudos : une colonne par cran de l'échelle 0, 1, 2, 3, 5, 8, du plus petit au plus grand vote chiffré joué, bornes comprises. Les crans non joués entre ces bornes SHALL apparaître avec 0 vote (trait plat) ; les crans en dehors MUST NOT apparaître. Les cartes `?` et ciseaux, si elles ont été jouées, SHALL suivre l'échelle, séparées d'elle, et ne pas apparaître sinon. Chaque colonne SHALL indiquer son nombre de votes ; sa hauteur est proportionnelle à ce nombre, et la ou les cartes les plus jouées SHALL ressortir en couleur pleine. Quand l'histogramme compte au moins deux crans chiffrés et qu'il y a une moyenne, un repère « moyenne » SHALL la situer entre les colonnes. Chaque colonne SHALL avoir un libellé accessible (« 2 : 4 votes »).

#### Scenario: Plage des votes
- **GIVEN** des votes révélés 2, 2, 2, 2, 3, 3
- **WHEN** les résultats s'affichent
- **THEN** l'histogramme a deux colonnes, 2 (4 votes, mise en avant) et 3 (2 votes), avec le repère de moyenne entre les deux, plus près de 2

#### Scenario: Crans non joués
- **GIVEN** des votes révélés 2, 3, 3, 3, 8, 8
- **WHEN** les résultats s'affichent
- **THEN** l'histogramme a les colonnes 2 (1), 3 (3), 5 (0) et 8 (2), sans colonnes 0 ni 1

#### Scenario: Cartes hors échelle
- **GIVEN** des votes révélés 1, 3, ?, ciseaux
- **WHEN** les résultats s'affichent
- **THEN** l'histogramme a les colonnes 1 (1), 2 (0), 3 (1), puis, séparées, ? (1) et ciseaux (1)

#### Scenario: Consensus
- **GIVEN** des votes révélés 5, 5, 5
- **WHEN** les résultats s'affichent
- **THEN** l'histogramme a une seule colonne, 5 (3 votes), sans repère de moyenne

### Requirement: Votes extrêmes
Après la révélation, le vote chiffré le plus bas et le vote chiffré le plus haut SHALL être déterminés, chacun avec les pseudos des participants présents qui l'ont joué, triés par ordre alphabétique ; ils servent à la mise en évidence des cartes et à l'encadré « Écart important ». Les résultats MUST NOT lister ces pseudos (« Plus bas » / « Plus haut »). Les cartes `?` et ciseaux MUST être ignorées. Les votes extrêmes MUST NOT être affichés quand il y a moins de deux valeurs chiffrées différentes. Dans la liste des présents, la carte révélée d'un participant qui a joué une valeur extrême SHALL être mise en évidence, avec un libellé accessible (« vote le plus bas » ou « vote le plus haut »).

#### Scenario: Extrêmes affichés
- **GIVEN** des votes révélés : Julie 1, Marc 8, Léa 8, Paul 3
- **WHEN** les résultats s'affichent
- **THEN** le plus bas est 1 (Julie), le plus haut 8 (Léa, Marc), et les cartes de Julie, Léa et Marc sont mises en évidence dans la liste des présents, sans liste de pseudos dans les résultats

#### Scenario: Cartes non chiffrées ignorées
- **GIVEN** des votes révélés : Julie ?, Marc 2, Léa 5, Paul ciseaux
- **WHEN** les résultats s'affichent
- **THEN** le plus bas est 2 (Marc) et le plus haut 5 (Léa)

#### Scenario: Pas d'extrêmes sans écart
- **GIVEN** des votes révélés : Julie 3, Marc 3, Léa ?
- **WHEN** les résultats s'affichent
- **THEN** aucune carte n'est mise en évidence comme extrême
