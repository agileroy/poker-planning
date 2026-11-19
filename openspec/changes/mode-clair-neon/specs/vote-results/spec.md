## MODIFIED Requirements

### Requirement: Présentation des messages à discuter
Les messages « Écart important », « Questions (carte ?) » et « Alerte ciseaux » SHALL partager une même présentation : encadré teinté avec une bordure de sa couleur, légèrement lumineuse, pastille ronde pleine contenant une icône, titre en gras puis texte. Chaque message SHALL avoir sa couleur, distincte du vert du consensus : orange avec une icône de bulles de discussion pour l'écart important, rouge avec une icône de point d'interrogation pour la carte `?`, violet avec une icône de ciseaux pour la carte ciseaux. Les couleurs SHALL rester lisibles en thème clair et en thème sombre ; les icônes sont décoratives (masquées aux lecteurs d'écran), le texte porte le sens.

#### Scenario: Messages distincts
- **GIVEN** des votes révélés : Julie 1, Marc 3, Paul ?, Léa ciseaux
- **WHEN** les résultats s'affichent
- **THEN** l'écart s'affiche en orange avec les bulles, la question en rouge avec le point d'interrogation, et l'alerte ciseaux en violet avec les ciseaux
