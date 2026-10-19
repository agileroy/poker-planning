## ADDED Requirements

### Requirement: Disposition des résultats sur grand écran
Sur un écran d'au moins 760 px de large, la salle SHALL afficher la liste des présents et la carte « Rejoindre avec un téléphone » côte à côte, puis, une fois les cartes révélées, les résultats sur toute la largeur, puis la zone « Votre carte ». À l'intérieur des résultats, les chiffres (moyenne, répartition, plus bas et plus haut) SHALL occuper la colonne de gauche et les messages (écart, consensus, question, ciseaux) la colonne de droite ; sans aucun message, les chiffres SHALL occuper toute la largeur. Sur un écran plus étroit, la disposition de la « Mise en page sur téléphone » MUST rester inchangée.

#### Scenario: Résultats sur toute la largeur
- **GIVEN** un écran de 1100 px et des cartes révélées avec un écart important
- **WHEN** la salle s'affiche
- **THEN** les résultats sont sous la liste des présents, aussi larges que la ligne « Présents / Rejoindre », avec les chiffres à gauche et l'encadré d'écart à droite

#### Scenario: Sans message
- **GIVEN** un écran de 1100 px et des cartes révélées sans écart, consensus, question ni ciseaux
- **WHEN** la salle s'affiche
- **THEN** les chiffres occupent toute la largeur des résultats
