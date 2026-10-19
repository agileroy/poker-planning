## MODIFIED Requirements

### Requirement: Écart important
L'écart entre deux cartes chiffrées SHALL se mesurer en crans sur l'échelle 0, 1, 2, 3, 5, 8 (de 1 à 3 : 2 crans ; de 3 à 5 : 1 cran ; de 1 à 8 : 4 crans). Après la révélation, quand le vote chiffré le plus bas et le plus haut (voir « Votes extrêmes ») ont au moins 2 crans d'écart, les résultats SHALL afficher un encadré dont le titre nomme les deux camps avec leur vote, sous la forme « Julie (1) et Marc (8) ne voient pas la story de la même façon », sans afficher le nombre de crans. L'encadré SHALL ensuite poser deux questions, chacune sur sa propre ligne quelle que soit la largeur de l'écran : aux participants du vote le plus bas, « qu'est-ce qui te paraît plus simple ? », puis à ceux du vote le plus haut, « qu'est-ce qui te paraît plus compliqué ? ». Le tutoiement s'accorde au nombre de personnes (« te » pour une personne, « vous » pour plusieurs). L'encadré MUST NOT s'afficher pour un écart d'un cran, sans votes extrêmes, ni avant la révélation.

#### Scenario: Deux crans d'écart
- **GIVEN** des votes révélés : Julie 1, Marc 3
- **WHEN** les résultats s'affichent
- **THEN** l'encadré a pour titre « Julie (1) et Marc (3) ne voient pas la story de la même façon », puis les lignes « Julie, qu'est-ce qui te paraît plus simple ? » et « Marc, qu'est-ce qui te paraît plus compliqué ? »

#### Scenario: Plusieurs personnes dans un camp
- **GIVEN** des votes révélés : Julie 1, Paul 1, Léa 2, Marc 8
- **WHEN** les résultats s'affichent
- **THEN** l'encadré a pour titre « Julie et Paul (1) et Marc (8) ne voient pas la story de la même façon », puis les lignes « Julie et Paul, qu'est-ce qui vous paraît plus simple ? » et « Marc, qu'est-ce qui te paraît plus compliqué ? »

#### Scenario: Un seul cran
- **GIVEN** des votes révélés : Julie 3, Marc 5
- **WHEN** les résultats s'affichent
- **THEN** aucun encadré d'écart ne s'affiche
