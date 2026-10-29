# Site Publication Specification

## Purpose
Publication sur GitHub Pages, interface (langue, appareils, thème), connexion au service temps réel et règles de sécurité versionnées.

## Requirements

### Requirement: Publication automatique
Le site SHALL être publié sur GitHub Pages, à l'adresse https://vinchou59.github.io/poker-planning/, à chaque push sur `main`. Les tests automatiques SHALL être lancés avant la publication, et la publication MUST NOT avoir lieu si un test échoue. Les tests SHALL aussi être lancés sur chaque pull request, sans publication.

#### Scenario: Test en échec
- **GIVEN** un push sur `main` qui casse un test
- **WHEN** le workflow GitHub Actions s'exécute
- **THEN** le job de tests échoue et le site publié reste la version précédente

### Requirement: Interface et appareils
L'interface SHALL être en français. Elle SHALL être utilisable sur ordinateur et sur téléphone (largeur de 360 px et plus) sans défilement horizontal, en thème clair et en thème sombre. Le site MUST NOT afficher de publicité ni charger de traceur.

#### Scenario: Affichage sur téléphone
- **GIVEN** un téléphone de 390 px de large
- **WHEN** un participant ouvre la salle
- **THEN** la liste des présents, les cartes et les boutons s'affichent sans défilement horizontal

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

### Requirement: Connexion au service temps réel
Le site SHALL n'utiliser que des connexions HTTPS (port 443) vers Firebase. Si le service temps réel est injoignable ou que la connexion est perdue, la salle SHALL afficher un message « Connexion perdue, reconnexion… » et reprendre automatiquement à son retour, sans recharger la page.

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

### Requirement: Mise en page sur téléphone
Sur un écran de moins de 760 px de large, la salle SHALL afficher dans cet ordre : le jeu de cartes (avec le choix « Je vote / J'observe »), les résultats une fois révélés, la liste des présents avec « Révéler », « Nouveau vote » et « Partager le lien », puis l'encadré « Observateurs » s'il y en a. Sur un écran plus large, la mise en page MUST NOT changer. À la révélation, chaque participant dont le navigateur le permet SHALL ressentir une courte vibration (au plus 200 ms) ; les navigateurs sans vibration (notamment Safari sur iPhone) SHALL fonctionner normalement, sans message d'erreur. Aucune vibration MUST NOT avoir lieu au chargement de la page si les cartes sont déjà révélées.

#### Scenario: Cartes à portée de pouce
- **GIVEN** un téléphone de 390 px de large
- **WHEN** la salle s'affiche
- **THEN** le jeu de cartes apparaît au-dessus de la liste des présents

#### Scenario: Résultats avant la liste
- **GIVEN** un téléphone de 390 px de large et des cartes révélées
- **WHEN** la salle s'affiche
- **THEN** les résultats apparaissent entre le jeu de cartes et la liste des présents

#### Scenario: Observateurs en dernier
- **GIVEN** un téléphone de 390 px de large et une observatrice dans la salle
- **WHEN** la salle s'affiche
- **THEN** l'encadré « Observateurs » apparaît sous la liste des présents

#### Scenario: Vibration à la révélation
- **GIVEN** Marc sur un téléphone qui permet la vibration, cartes non révélées
- **WHEN** Julie clique sur « Révéler »
- **THEN** le téléphone de Marc vibre brièvement

#### Scenario: Pas de vibration à l'arrivée
- **GIVEN** des cartes déjà révélées
- **WHEN** Marc ouvre la salle
- **THEN** son téléphone ne vibre pas

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
