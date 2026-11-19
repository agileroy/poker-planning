## RENAMED Requirements

- FROM: `### Requirement: Moyenne des cartes chiffrées`
- TO: `### Requirement: Médiane des cartes chiffrées`

## MODIFIED Requirements

### Requirement: Répartition des votes
La répartition SHALL s'afficher sous forme d'histogramme, sans pseudos : une colonne par cran de l'échelle 0, 1, 2, 3, 5, 8, du plus petit au plus grand vote chiffré joué, bornes comprises. Les crans non joués entre ces bornes SHALL apparaître avec 0 vote (trait plat) ; les crans en dehors MUST NOT apparaître. Les cartes `?` et ciseaux, si elles ont été jouées, SHALL suivre l'échelle, séparées d'elle, et ne pas apparaître sinon. Chaque colonne SHALL indiquer son nombre de votes ; sa hauteur est proportionnelle à ce nombre, et la ou les cartes les plus jouées SHALL ressortir en couleur pleine. Quand l'histogramme compte au moins deux crans chiffrés, un repère « médiane » SHALL se placer sur la colonne de la médiane, ou à mi-chemin entre les deux colonnes du milieu quand elle tombe entre deux cartes. Chaque colonne SHALL avoir un libellé accessible (« 2 : 4 votes »).

#### Scenario: Plage des votes
- **GIVEN** des votes révélés 2, 2, 2, 2, 3, 3
- **WHEN** les résultats s'affichent
- **THEN** l'histogramme a deux colonnes, 2 (4 votes, mise en avant) et 3 (2 votes), avec le repère de médiane sur 2

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
- **THEN** l'histogramme a une seule colonne, 5 (3 votes), sans repère de médiane

### Requirement: Résultats affichés après la révélation
Après la révélation, la salle SHALL afficher les résultats des votes des participants présents. Avant la révélation, les résultats MUST NOT être affichés. Les résultats SHALL comprendre la répartition des votes, la médiane, et selon le cas le message de consensus et l'alerte ciseaux.

#### Scenario: Pas de résultats avant la révélation
- **GIVEN** des votes en cours, cartes non révélées
- **WHEN** la salle s'affiche
- **THEN** aucune répartition, médiane ni message de consensus n'est visible

### Requirement: Médiane des cartes chiffrées
Les résultats SHALL afficher, sous le libellé « Médiane », la médiane des seules cartes chiffrées ; les cartes `?` et ciseaux MUST être exclues. Avec un nombre impair de cartes chiffrées, ou quand les deux cartes du milieu sont identiques, la médiane SHALL s'afficher comme cette carte (« 3 »). Quand le nombre est pair et que les deux cartes du milieu diffèrent, les deux SHALL s'afficher, de la plus petite à la plus grande (« 2 – 3 »), sans valeur intermédiaire. S'il n'y a aucune carte chiffrée, la médiane SHALL s'afficher « – ». Les résultats MUST NOT afficher de moyenne.

#### Scenario: Médiane avec cartes non chiffrées
- **GIVEN** des votes révélés 3, 5, 8, ?, ciseaux
- **WHEN** les résultats s'affichent
- **THEN** la médiane affichée est « 5 »

#### Scenario: Vote isolé
- **GIVEN** des votes révélés 2, 2, 2, 2, 8
- **WHEN** les résultats s'affichent
- **THEN** la médiane affichée est « 2 »

#### Scenario: Nombre pair, cartes du milieu identiques
- **GIVEN** des votes révélés 2, 2, 2, 2, 3, 3
- **WHEN** les résultats s'affichent
- **THEN** la médiane affichée est « 2 »

#### Scenario: Nombre pair, cartes du milieu différentes
- **GIVEN** des votes révélés 2, 2, 3, 3
- **WHEN** les résultats s'affichent
- **THEN** la médiane affichée est « 2 – 3 »

#### Scenario: Aucune carte chiffrée
- **GIVEN** des votes révélés ?, ciseaux
- **WHEN** les résultats s'affichent
- **THEN** la médiane affichée est « – »
