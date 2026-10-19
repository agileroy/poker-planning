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

### Requirement: Questions (carte ?)
Après la révélation, si au moins un participant présent a joué la carte `?`, les résultats SHALL afficher un message qui nomme ces participants, triés par ordre alphabétique, avec pour titre « Julie a joué « ? » » (une personne) ou « Julie et Paul ont joué « ? » » (plusieurs), puis le texte « Prenez le temps de clarifier la story avec elle ou lui. » (une personne) ou « Prenez le temps de clarifier la story avec eux. » (plusieurs). Le message MUST NOT s'afficher avant la révélation ni quand personne n'a joué `?`.

#### Scenario: Une question
- **GIVEN** des votes révélés : Julie ?, Marc 3, Paul 5
- **WHEN** les résultats s'affichent
- **THEN** le message a pour titre « Julie a joué « ? » » et pour texte « Prenez le temps de clarifier la story avec elle ou lui. »

#### Scenario: Plusieurs questions
- **GIVEN** des votes révélés : Paul ?, Julie ?, Marc 3
- **WHEN** les résultats s'affichent
- **THEN** le message a pour titre « Julie et Paul ont joué « ? » » et pour texte « Prenez le temps de clarifier la story avec eux. »

#### Scenario: Aucune question
- **GIVEN** des votes révélés : Julie 3, Marc 5
- **WHEN** les résultats s'affichent
- **THEN** aucun message de question ne s'affiche

### Requirement: Écart important
L'écart entre deux cartes chiffrées SHALL se mesurer en crans sur l'échelle 0, 1, 2, 3, 5, 8 (de 1 à 3 : 2 crans ; de 3 à 5 : 1 cran ; de 1 à 8 : 4 crans). Après la révélation, quand le vote chiffré le plus bas et le plus haut (voir « Votes extrêmes ») ont au moins 2 crans d'écart, les résultats SHALL afficher un encadré qui donne l'écart et nomme les deux camps, puis les invite à s'expliquer : ceux du vote le plus bas sur ce qui leur paraît plus simple, ceux du vote le plus haut sur ce qui leur paraît plus compliqué. Le tutoiement s'accorde au nombre de personnes (« te » pour une personne, « vous » pour plusieurs). L'encadré MUST NOT s'afficher pour un écart d'un cran, sans votes extrêmes, ni avant la révélation.

#### Scenario: Deux crans d'écart
- **GIVEN** des votes révélés : Julie 1, Marc 3
- **WHEN** les résultats s'affichent
- **THEN** l'encadré indique « 2 crans d'écart entre Julie (1) et Marc (3) » et « Julie, qu'est-ce qui te paraît plus simple ? Marc, qu'est-ce qui te paraît plus compliqué ? »

#### Scenario: Plusieurs personnes dans un camp
- **GIVEN** des votes révélés : Julie 1, Paul 1, Léa 2, Marc 8
- **WHEN** les résultats s'affichent
- **THEN** l'encadré indique « 4 crans d'écart entre Julie et Paul (1) et Marc (8) » et « Julie et Paul, qu'est-ce qui vous paraît plus simple ? Marc, qu'est-ce qui te paraît plus compliqué ? »

#### Scenario: Un seul cran
- **GIVEN** des votes révélés : Julie 3, Marc 5
- **WHEN** les résultats s'affichent
- **THEN** aucun encadré d'écart ne s'affiche

### Requirement: Présentation des messages à discuter
Les messages « Écart important », « Questions (carte ?) » et « Alerte ciseaux » SHALL partager une même présentation : encadré teinté avec une bordure de sa couleur, pastille ronde pleine contenant une icône blanche, titre en gras puis texte. Chaque message SHALL avoir sa couleur, distincte du vert du consensus : orange avec une icône de bulles de discussion pour l'écart important, rouge avec une icône de point d'interrogation pour la carte `?`, violet avec une icône de ciseaux pour la carte ciseaux. Les couleurs SHALL rester lisibles en thème clair et en thème sombre ; les icônes sont décoratives (masquées aux lecteurs d'écran), le texte porte le sens.

#### Scenario: Messages distincts
- **GIVEN** des votes révélés : Julie 1, Marc 3, Paul ?, Léa ciseaux
- **WHEN** les résultats s'affichent
- **THEN** l'écart s'affiche en orange avec les bulles, la question en rouge avec le point d'interrogation, et l'alerte ciseaux en violet avec les ciseaux
