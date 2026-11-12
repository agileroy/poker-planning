## REMOVED Requirements

### Requirement: Salle unique
**Reason**: le site sert à plusieurs équipes, chacune dans sa salle.
**Migration**: voir `room-management` (« Salles indépendantes », « Lister les salles ») ; l'adresse du site ouvre la liste des salles.

## ADDED Requirements

### Requirement: Revenir à la liste des salles
Une salle SHALL afficher son nom et un lien « Toutes les salles ». Revenir à la liste, par ce lien ou par le bouton Précédent du navigateur, SHALL quitter la salle comme le bouton « Quitter » (présence, vote non révélé et pseudo libérés), sans écran intermédiaire. Ouvrir une autre salle SHALL de même quitter la précédente : un navigateur MUST NOT être présent dans deux salles à la fois depuis le même onglet.

#### Scenario: Retour à la liste
- **GIVEN** Julie et Marc dans la salle « Produit »
- **WHEN** Marc clique sur « Toutes les salles »
- **THEN** Marc voit la liste des salles, et il disparaît de la liste des présents de Julie

## MODIFIED Requirements

### Requirement: Rejoindre avec un téléphone
Sur un écran large (760 px et plus), la salle SHALL afficher en permanence une carte « Rejoindre avec un téléphone » avec un QR code de l'adresse de la salle ouverte et cette adresse en clair, sans gêner la liste des présents, les cartes ni les résultats. Un clic sur le QR code SHALL l'afficher en grand au centre de l'écran ; la touche Échap, un clic en dehors ou un bouton « Fermer » SHALL le refermer. Le QR code SHALL rester lisible en thème sombre (modules sombres sur fond clair). Sur un écran étroit, le QR code MUST NOT être affiché ; un bouton « Partager le lien » SHALL ouvrir le partage du téléphone avec l'adresse de la salle, ou à défaut copier cette adresse et le confirmer. Le générateur de QR code SHALL être embarqué dans le site, sans chargement depuis un service externe.

#### Scenario: Retardataire en réunion
- **GIVEN** l'animateur qui partage son écran d'ordinateur, salle « Produit » ouverte
- **WHEN** un retardataire scanne le QR code de la carte « Rejoindre avec un téléphone »
- **THEN** son téléphone ouvre la salle « Produit », et il peut choisir son pseudo

#### Scenario: QR code agrandi
- **GIVEN** la salle sur un ordinateur
- **WHEN** l'utilisateur clique sur le QR code, puis appuie sur Échap
- **THEN** le QR code s'affiche en grand au centre de l'écran, puis se referme

#### Scenario: Sur téléphone
- **GIVEN** la salle sur un téléphone de 390 px de large
- **WHEN** elle s'affiche
- **THEN** aucun QR code n'est visible, et un bouton « Partager le lien » est proposé

### Requirement: Pseudo unique dans la salle
Deux participants présents dans la même salle MUST NOT avoir le même pseudo ; le même pseudo SHALL rester possible dans deux salles différentes. La comparaison SHALL ignorer la casse et les espaces de début et de fin. Un pseudo déjà pris SHALL être refusé avec un message demandant d'en choisir un autre. Un pseudo SHALL redevenir disponible dès que son titulaire a quitté la salle.

#### Scenario: Pseudo déjà pris
- **GIVEN** « Julie » présente dans la salle « Produit »
- **WHEN** un autre participant choisit « julie » dans cette salle
- **THEN** il reste sur l'écran de choix avec le message « Ce pseudo est déjà utilisé, choisissez-en un autre »

#### Scenario: Même pseudo dans une autre salle
- **GIVEN** « Julie » présente dans la salle « Produit »
- **WHEN** une autre personne choisit « Julie » dans la salle « Tech »
- **THEN** elle entre dans la salle « Tech » sous ce pseudo

#### Scenario: Pseudo libéré
- **GIVEN** « Julie » qui a fermé son onglet
- **WHEN** un autre participant choisit « Julie » dans la même salle
- **THEN** il entre dans la salle sous ce pseudo

### Requirement: Pseudo mémorisé
Le pseudo choisi SHALL être mémorisé dans le navigateur, pour toutes les salles. Aux visites suivantes, dans n'importe quelle salle, le participant SHALL entrer directement avec ce pseudo, sans le ressaisir. Si le pseudo mémorisé est pris par un autre participant présent dans la salle, l'écran de choix SHALL s'afficher, prérempli, avec le message de pseudo déjà utilisé. L'écran de choix SHALL rappeler le nom de la salle. Depuis la salle, le participant SHALL pouvoir changer de pseudo, selon les mêmes règles.

#### Scenario: Retour d'un participant
- **GIVEN** un participant qui a choisi « Marc » la semaine précédente dans ce navigateur, dans la salle « Produit »
- **WHEN** il ouvre la salle « Tech »
- **THEN** il arrive directement dans la salle « Tech » sous le pseudo « Marc »

#### Scenario: Changement de pseudo
- **GIVEN** « Marc » dans la salle
- **WHEN** il choisit « Changer de pseudo » et saisit « Marco »
- **THEN** les autres participants voient « Marco » à la place de « Marc », et « Marco » est mémorisé

### Requirement: Quitter la salle
La salle SHALL proposer un bouton « Quitter ». Il SHALL retirer immédiatement le participant de la liste des présents de tous les participants, retirer son vote si les cartes ne sont pas révélées, et libérer son pseudo. Il SHALL ensuite demander au navigateur de fermer l'onglet. Les navigateurs n'autorisant cette fermeture que dans certains cas (onglet ouvert par un script, ou onglet sans autre page dans son historique), l'onglet SHALL, s'il reste ouvert, afficher « Vous avez quitté la salle » avec un bouton « Revenir dans la salle » et un lien « Toutes les salles ». Le pseudo SHALL rester mémorisé dans le navigateur pour le retour.

#### Scenario: Quitter la salle
- **GIVEN** Julie et Marc dans la salle, Marc ayant voté 5, cartes non révélées
- **WHEN** Marc clique sur « Quitter »
- **THEN** Marc disparaît aussitôt de la liste de Julie, son vote n'est plus compté, et chez Marc l'onglet se ferme ou affiche « Vous avez quitté la salle »

#### Scenario: Retour après avoir quitté
- **GIVEN** l'écran « Vous avez quitté la salle » chez Marc
- **WHEN** il clique sur « Revenir dans la salle »
- **THEN** il revient dans la même salle sous le pseudo « Marc », sans le ressaisir
