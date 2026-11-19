## MODIFIED Requirements

### Requirement: Interface et appareils
L'interface SHALL être en français. Elle SHALL être utilisable sur ordinateur et sur téléphone (largeur de 360 px et plus) sans défilement horizontal. Elle SHALL avoir une ambiance de casino néon, sur un thème sombre unique : fond nuit, titres en enseigne néon, boutons et cartes lumineux ; chaque texte SHALL garder un contraste d'au moins 4,5:1 avec son fond, les halos lumineux étant décoratifs. Les polices SHALL être embarquées dans le site. Le site MUST NOT afficher de publicité, charger de traceur ni charger de ressource depuis un service tiers (polices comprises).

#### Scenario: Affichage sur téléphone
- **GIVEN** un téléphone de 390 px de large
- **WHEN** un participant ouvre la salle
- **THEN** la liste des présents, les cartes et les boutons s'affichent sans défilement horizontal

#### Scenario: Même ambiance pour tous
- **GIVEN** un système réglé en thème clair
- **WHEN** un participant ouvre le site
- **THEN** la page s'affiche dans l'ambiance néon sur fond sombre

## REMOVED Requirements

### Requirement: Choix du thème clair ou sombre
**Reason**: l'ambiance casino néon n'existe que sur fond sombre ; un thème clair la viderait de son intérêt.
**Migration**: aucune ; un choix de thème mémorisé dans le navigateur est ignoré.
