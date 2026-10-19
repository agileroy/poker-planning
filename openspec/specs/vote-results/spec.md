# Vote Results Specification

## Purpose
Résultats affichés après la révélation : répartition, moyenne, consensus et alerte ciseaux. Couvre `computeResults` dans `site/js/poker-core.js`.

## Requirements

### Requirement: Résultats affichés après la révélation
Après la révélation, la salle SHALL afficher les résultats des votes des participants présents. Avant la révélation, les résultats MUST NOT être affichés. Les résultats SHALL comprendre la répartition des votes, la moyenne, et selon le cas le message de consensus et l'alerte ciseaux.

#### Scenario: Pas de résultats avant la révélation
- **GIVEN** des votes en cours, cartes non révélées
- **WHEN** la salle s'affiche
- **THEN** aucune répartition, moyenne ni message de consensus n'est visible

### Requirement: Répartition des votes
La répartition SHALL indiquer, pour chaque carte jouée au moins une fois, le nombre de votes, dans l'ordre du jeu de cartes (par exemple « 3 × 5 · 1 × 8 »). Les cartes non jouées MUST NOT apparaître.

#### Scenario: Répartition
- **GIVEN** des votes révélés 5, 8, 5, 5
- **WHEN** les résultats s'affichent
- **THEN** la répartition indique 3 votes pour 5 et 1 vote pour 8, dans cet ordre

### Requirement: Moyenne des cartes chiffrées
La moyenne SHALL être calculée sur les seules cartes chiffrées ; les cartes `?` et ciseaux MUST être exclues. Elle SHALL être arrondie à une décimale, avec une virgule comme séparateur (« 5,8 »), sans décimale quand elle est entière (« 5 »). S'il n'y a aucune carte chiffrée, la moyenne SHALL s'afficher « – ».

#### Scenario: Moyenne avec cartes non chiffrées
- **GIVEN** des votes révélés 3, 5, ?, ciseaux
- **WHEN** les résultats s'affichent
- **THEN** la moyenne affichée est « 4 »

#### Scenario: Moyenne arrondie
- **GIVEN** des votes révélés 3, 5, 8
- **WHEN** les résultats s'affichent
- **THEN** la moyenne affichée est « 5,3 »

#### Scenario: Moyenne décimale
- **GIVEN** des votes révélés 1, 2
- **WHEN** les résultats s'affichent
- **THEN** la moyenne affichée est « 1,5 »

#### Scenario: Aucune carte chiffrée
- **GIVEN** des votes révélés ?, ciseaux
- **WHEN** les résultats s'affichent
- **THEN** la moyenne affichée est « – »

### Requirement: Consensus
Un message de consensus SHALL s'afficher quand au moins deux participants ont voté et que tous les votes portent sur la même carte chiffrée. Il MUST NOT s'afficher pour un seul votant, ni quand la carte commune est `?` ou ciseaux.

#### Scenario: Consensus
- **GIVEN** des votes révélés 3, 3, 3
- **WHEN** les résultats s'affichent
- **THEN** le message « Consensus : 3 » s'affiche

#### Scenario: Pas de consensus
- **GIVEN** des votes révélés 3, 3, 5
- **WHEN** les résultats s'affichent
- **THEN** aucun message de consensus ne s'affiche

### Requirement: Alerte ciseaux
Si au moins une carte ciseaux a été jouée, les résultats SHALL afficher l'alerte « Story à découper ? » avec le nombre de cartes ciseaux jouées.

#### Scenario: Carte ciseaux jouée
- **GIVEN** des votes révélés 5, 8, ciseaux
- **WHEN** les résultats s'affichent
- **THEN** l'alerte « Story à découper ? » s'affiche avec 1 carte ciseaux

### Requirement: Votes extrêmes
Après la révélation, les résultats SHALL indiquer le vote chiffré le plus bas et le vote chiffré le plus haut, chacun avec les pseudos des participants présents qui l'ont joué, triés par ordre alphabétique. Les cartes `?` et ciseaux MUST être ignorées. Les votes extrêmes MUST NOT être affichés quand il y a moins de deux valeurs chiffrées différentes. Dans la liste des présents, la carte révélée d'un participant qui a joué une valeur extrême SHALL être mise en évidence, avec un libellé accessible (« vote le plus bas » ou « vote le plus haut »).

#### Scenario: Extrêmes affichés
- **GIVEN** des votes révélés : Julie 1, Marc 8, Léa 8, Paul 3
- **WHEN** les résultats s'affichent
- **THEN** ils indiquent « Plus bas : 1 — Julie » et « Plus haut : 8 — Léa, Marc »

#### Scenario: Cartes non chiffrées ignorées
- **GIVEN** des votes révélés : Julie ?, Marc 2, Léa 5, Paul ciseaux
- **WHEN** les résultats s'affichent
- **THEN** ils indiquent « Plus bas : 2 — Marc » et « Plus haut : 5 — Léa »

#### Scenario: Pas d'extrêmes sans écart
- **GIVEN** des votes révélés : Julie 3, Marc 3, Léa ?
- **WHEN** les résultats s'affichent
- **THEN** aucun vote extrême n'est affiché
