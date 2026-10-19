## ADDED Requirements

### Requirement: Questions (carte ?)
Après la révélation, si au moins un participant présent a joué la carte `?`, les résultats SHALL afficher un message qui nomme ces participants, triés par ordre alphabétique, et invite à clarifier la story avec eux : « Julie a joué « ? » : prenez le temps de clarifier la story avec elle ou lui. » pour une personne, « Julie et Paul ont joué « ? » : prenez le temps de clarifier la story avec eux. » pour plusieurs. Le message MUST NOT s'afficher avant la révélation ni quand personne n'a joué `?`.

#### Scenario: Une question
- **GIVEN** des votes révélés : Julie ?, Marc 3, Paul 5
- **WHEN** les résultats s'affichent
- **THEN** le message « Julie a joué « ? » : prenez le temps de clarifier la story avec elle ou lui. » s'affiche

#### Scenario: Plusieurs questions
- **GIVEN** des votes révélés : Paul ?, Julie ?, Marc 3
- **WHEN** les résultats s'affichent
- **THEN** le message « Julie et Paul ont joué « ? » : prenez le temps de clarifier la story avec eux. » s'affiche

#### Scenario: Aucune question
- **GIVEN** des votes révélés : Julie 3, Marc 5
- **WHEN** les résultats s'affichent
- **THEN** aucun message de question ne s'affiche
