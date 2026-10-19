## ADDED Requirements

### Requirement: Présentation des messages à discuter
Les messages « Écart important », « Questions (carte ?) » et « Alerte ciseaux » SHALL partager une même présentation : encadré teinté avec une bordure de sa couleur, pastille ronde pleine contenant une icône blanche, titre en gras puis texte. Chaque message SHALL avoir sa couleur, distincte du vert du consensus : orange avec une icône de bulles de discussion pour l'écart important, rouge avec une icône de point d'interrogation pour la carte `?`, violet avec une icône de ciseaux pour la carte ciseaux. Les couleurs SHALL rester lisibles en thème clair et en thème sombre ; les icônes sont décoratives (masquées aux lecteurs d'écran), le texte porte le sens.

#### Scenario: Messages distincts
- **GIVEN** des votes révélés : Julie 1, Marc 3, Paul ?, Léa ciseaux
- **WHEN** les résultats s'affichent
- **THEN** l'écart s'affiche en orange avec les bulles, la question en rouge avec le point d'interrogation, et l'alerte ciseaux en violet avec les ciseaux

## MODIFIED Requirements

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
