## MODIFIED Requirements

### Requirement: Médiane des cartes chiffrées
Les résultats SHALL se présenter comme une machine à sous à trois rouleaux : « Plus bas » (la plus petite carte chiffrée jouée), « Médiane » au centre, mis en avant, et « Plus haut » (la plus grande carte chiffrée jouée). Sans carte chiffrée, les trois rouleaux SHALL afficher « – ». La médiane SHALL porter sur les seules cartes chiffrées ; les cartes `?` et ciseaux MUST être exclues. Avec un nombre impair de cartes chiffrées, ou quand les deux cartes du milieu sont identiques, la médiane SHALL s'afficher comme cette carte (« 3 »). Quand le nombre est pair et que les deux cartes du milieu diffèrent, les deux SHALL s'afficher, de la plus petite à la plus grande (« 2 – 3 »), sans valeur intermédiaire. S'il n'y a aucune carte chiffrée, la médiane SHALL s'afficher « – ». Les résultats MUST NOT afficher de moyenne.

#### Scenario: Médiane avec cartes non chiffrées
- **GIVEN** des votes révélés 3, 5, 8, ?, ciseaux
- **WHEN** les résultats s'affichent
- **THEN** les rouleaux affichent « 3 », « 5 » (médiane) et « 8 »

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
- **THEN** les trois rouleaux affichent « – »

### Requirement: Consensus
Un message de consensus SHALL s'afficher quand au moins deux participants ont voté et que tous les votes portent sur la même carte chiffrée. Il SHALL se présenter comme un jackpot : « Jackpot ! Consensus : 3 », et les trois rouleaux de la machine à sous s'allument. Il MUST NOT s'afficher pour un seul votant, ni quand la carte commune est `?` ou ciseaux.

#### Scenario: Consensus
- **GIVEN** des votes révélés 3, 3, 3
- **WHEN** les résultats s'affichent
- **THEN** le message « Jackpot ! Consensus : 3 » s'affiche et les trois rouleaux sont allumés

#### Scenario: Pas de consensus
- **GIVEN** des votes révélés 3, 3, 5
- **WHEN** les résultats s'affichent
- **THEN** aucun message de consensus ne s'affiche

### Requirement: Présentation des messages à discuter
Les messages « Écart important », « Questions (carte ?) » et « Alerte ciseaux » SHALL partager une même présentation : encadré sombre avec une bordure néon de sa couleur, pastille ronde pleine contenant une icône, titre en gras puis texte. Chaque message SHALL avoir sa couleur, distincte du vert du consensus : orange avec une icône de bulles de discussion pour l'écart important, rouge avec une icône de point d'interrogation pour la carte `?`, violet avec une icône de ciseaux pour la carte ciseaux. Les textes SHALL rester lisibles sur le fond sombre ; les icônes sont décoratives (masquées aux lecteurs d'écran), le texte porte le sens.

#### Scenario: Messages distincts
- **GIVEN** des votes révélés : Julie 1, Marc 3, Paul ?, Léa ciseaux
- **WHEN** les résultats s'affichent
- **THEN** l'écart s'affiche en orange avec les bulles, la question en rouge avec le point d'interrogation, et l'alerte ciseaux en violet avec les ciseaux
