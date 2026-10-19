## ADDED Requirements

### Requirement: Publication automatique
Le site SHALL être publié sur GitHub Pages, à l'adresse https://vinchou59.github.io/poker-planning/, à chaque push sur `main`. Les tests automatiques SHALL être lancés avant la publication, et la publication MUST NOT avoir lieu si un test échoue. Les tests SHALL aussi être lancés sur chaque pull request, sans publication.

#### Scenario: Test en échec
- **GIVEN** un push sur `main` qui casse un test
- **WHEN** le workflow GitHub Actions s'exécute
- **THEN** le job de tests échoue et le site publié reste la version précédente

### Requirement: Interface et appareils
L'interface SHALL être en français. Elle SHALL être utilisable sur ordinateur et sur téléphone (largeur de 360 px et plus) sans défilement horizontal, en thème clair et en thème sombre selon le réglage du système. Le site MUST NOT afficher de publicité ni charger de traceur.

#### Scenario: Affichage sur téléphone
- **GIVEN** un téléphone de 390 px de large
- **WHEN** un participant ouvre la salle
- **THEN** la liste des présents, les cartes et les boutons s'affichent sans défilement horizontal

### Requirement: Connexion au service temps réel
Le site SHALL n'utiliser que des connexions HTTPS vers Firebase, compatibles avec un VPN d'entreprise. Si le service temps réel est injoignable ou que la connexion est perdue, la salle SHALL afficher un message « Connexion perdue, reconnexion… » et reprendre automatiquement à son retour, sans recharger la page.

#### Scenario: Coupure réseau
- **GIVEN** un participant dans la salle
- **WHEN** sa connexion réseau est coupée puis rétablie
- **THEN** le message de connexion perdue s'affiche pendant la coupure, puis disparaît et la salle se met à jour

### Requirement: Règles de sécurité versionnées
Les règles de sécurité de la base Firebase SHALL être versionnées dans le dépôt (`database.rules.json`). Elles MUST imposer qu'un participant identifié ne modifie que sa propre présence et son propre vote, n'écrive que des valeurs de carte valides, et ne vote pas une fois les cartes révélées.

#### Scenario: Écriture du vote d'un autre
- **GIVEN** Marc connecté
- **WHEN** son navigateur tente d'écrire le vote de Julie
- **THEN** la base refuse l'écriture
