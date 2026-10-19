## ADDED Requirements

### Requirement: Salle unique
Le site SHALL proposer une seule salle de poker planning, commune à tous les participants et accessible directement à l'adresse du site. Le site MUST NOT demander de créer une salle, de saisir un code ni de créer un compte.

#### Scenario: Arrivée par le lien
- **GIVEN** deux personnes qui ouvrent l'adresse du site sur deux ordinateurs différents
- **WHEN** elles ont choisi leur pseudo
- **THEN** elles se retrouvent dans la même salle et se voient mutuellement dans la liste des présents

### Requirement: Choix du pseudo
À sa première arrivée, le participant SHALL choisir un pseudo avant d'entrer dans la salle. Le pseudo SHALL être débarrassé de ses espaces de début et de fin, et compter de 1 à 20 caractères. Un pseudo vide ou trop long MUST être refusé avec un message qui explique la règle.

#### Scenario: Première arrivée
- **GIVEN** un navigateur qui n'a jamais utilisé le site
- **WHEN** le participant ouvre l'adresse du site
- **THEN** l'écran de choix du pseudo s'affiche, et la salle n'est pas visible

#### Scenario: Pseudo vide
- **GIVEN** l'écran de choix du pseudo
- **WHEN** le participant valide «   » (uniquement des espaces)
- **THEN** il reste sur l'écran avec le message « Choisissez un pseudo de 1 à 20 caractères »

### Requirement: Pseudo unique dans la salle
Deux participants présents MUST NOT avoir le même pseudo. La comparaison SHALL ignorer la casse et les espaces de début et de fin. Un pseudo déjà pris SHALL être refusé avec un message demandant d'en choisir un autre. Un pseudo SHALL redevenir disponible dès que son titulaire a quitté la salle.

#### Scenario: Pseudo déjà pris
- **GIVEN** « Julie » présente dans la salle
- **WHEN** un autre participant choisit « julie »
- **THEN** il reste sur l'écran de choix avec le message « Ce pseudo est déjà utilisé, choisissez-en un autre »

#### Scenario: Pseudo libéré
- **GIVEN** « Julie » qui a fermé son onglet
- **WHEN** un autre participant choisit « Julie »
- **THEN** il entre dans la salle sous ce pseudo

### Requirement: Pseudo mémorisé
Le pseudo choisi SHALL être mémorisé dans le navigateur. Aux visites suivantes, le participant SHALL entrer directement dans la salle avec ce pseudo, sans le ressaisir. Si le pseudo mémorisé est pris par un autre participant présent, l'écran de choix SHALL s'afficher, prérempli, avec le message de pseudo déjà utilisé. Depuis la salle, le participant SHALL pouvoir changer de pseudo, selon les mêmes règles.

#### Scenario: Retour d'un participant
- **GIVEN** un participant qui a choisi « Marc » la semaine précédente dans ce navigateur
- **WHEN** il ouvre l'adresse du site
- **THEN** il arrive directement dans la salle sous le pseudo « Marc »

#### Scenario: Changement de pseudo
- **GIVEN** « Marc » dans la salle
- **WHEN** il choisit « Changer de pseudo » et saisit « Marco »
- **THEN** les autres participants voient « Marco » à la place de « Marc », et « Marco » est mémorisé

### Requirement: Liste des présents en temps réel
La salle SHALL afficher la liste des participants présents, triée par ordre alphabétique, avec le participant courant signalé (« vous »). La liste SHALL se mettre à jour en temps réel, sans recharger la page, quand un participant arrive, change de pseudo ou quitte la page. Un participant dont la connexion est coupée sans fermeture de page SHALL disparaître de la liste dès que le service temps réel détecte la déconnexion.

#### Scenario: Arrivée d'un participant
- **GIVEN** Julie et Marc dans la salle
- **WHEN** Léa entre dans la salle
- **THEN** Léa apparaît dans la liste de Julie et de Marc en quelques secondes

#### Scenario: Départ d'un participant
- **GIVEN** Julie, Marc et Léa dans la salle
- **WHEN** Léa ferme son onglet
- **THEN** Léa disparaît de la liste de Julie et de Marc

### Requirement: Quitter la salle
La salle SHALL proposer un bouton « Quitter ». Il SHALL retirer immédiatement le participant de la liste des présents de tous les participants, retirer son vote si les cartes ne sont pas révélées, et libérer son pseudo. Il SHALL ensuite demander au navigateur de fermer l'onglet. Les navigateurs n'autorisant cette fermeture que dans certains cas (onglet ouvert par un script, ou onglet sans autre page dans son historique), l'onglet SHALL, s'il reste ouvert, afficher « Vous avez quitté la salle » avec un bouton « Revenir dans la salle ». Le pseudo SHALL rester mémorisé dans le navigateur pour le retour.

#### Scenario: Quitter la salle
- **GIVEN** Julie et Marc dans la salle, Marc ayant voté 5, cartes non révélées
- **WHEN** Marc clique sur « Quitter »
- **THEN** Marc disparaît aussitôt de la liste de Julie, son vote n'est plus compté, et chez Marc l'onglet se ferme ou affiche « Vous avez quitté la salle »

#### Scenario: Retour après avoir quitté
- **GIVEN** l'écran « Vous avez quitté la salle » chez Marc
- **WHEN** il clique sur « Revenir dans la salle »
- **THEN** il revient dans la salle sous le pseudo « Marc », sans le ressaisir

### Requirement: Rechargement et onglets multiples
Recharger la page MUST NOT faire perdre au participant son pseudo ni son vote du tour en cours. Plusieurs onglets ouverts dans le même navigateur SHALL représenter un seul participant, présent tant qu'au moins un onglet est ouvert.

#### Scenario: Rechargement pendant un vote
- **GIVEN** Marc qui a voté 5, cartes non révélées
- **WHEN** il recharge la page
- **THEN** il revient dans la salle sous le pseudo « Marc » avec sa carte 5 sélectionnée, et les autres le voient toujours comme ayant voté
