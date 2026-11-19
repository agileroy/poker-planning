## MODIFIED Requirements

### Requirement: Interface et appareils
L'interface SHALL être en français. Elle SHALL être utilisable sur ordinateur et sur téléphone (largeur de 360 px et plus) sans défilement horizontal, en thème clair et en thème sombre. Elle SHALL avoir une ambiance de casino néon dans les deux thèmes : titres en enseigne néon, boutons et cartes lumineux, néon de nuit sur fond sombre en thème sombre, néons foncés sur fond crème en thème clair. Chaque texte SHALL garder un contraste d'au moins 4,5:1 avec son fond, les halos lumineux étant décoratifs. Les polices SHALL être embarquées dans le site. Le site MUST NOT afficher de publicité, charger de traceur ni charger de ressource depuis un service tiers (polices comprises).

#### Scenario: Affichage sur téléphone
- **GIVEN** un téléphone de 390 px de large
- **WHEN** un participant ouvre la salle
- **THEN** la liste des présents, les cartes et les boutons s'affichent sans défilement horizontal, en thème clair comme en thème sombre

## ADDED Requirements

### Requirement: Choix du thème clair ou sombre
Par défaut, le thème SHALL suivre le réglage du système. Un bouton, visible sur tous les écrans (pseudo et salle), SHALL basculer entre thème clair et thème sombre ; son libellé accessible SHALL indiquer le thème vers lequel il bascule (« Passer en thème sombre » ou « Passer en thème clair »). Le choix SHALL être mémorisé dans le navigateur et appliqué dès l'affichage de la page, sans clignotement du thème par défaut. Ce choix est propre à chaque participant et MUST NOT être partagé avec la salle.

#### Scenario: Bascule vers le thème sombre
- **GIVEN** un système en thème clair et aucun choix mémorisé
- **WHEN** le participant clique sur le bouton de thème
- **THEN** la page passe en thème sombre et le bouton propose « Passer en thème clair »

#### Scenario: Choix mémorisé
- **GIVEN** un participant qui a choisi le thème sombre
- **WHEN** il recharge la page avec un système en thème clair
- **THEN** la page s'affiche directement en thème sombre
