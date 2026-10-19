# Participant Presence Specification

## Purpose
Arrivée dans la salle unique, pseudo, liste des présents en temps réel, sortie volontaire et retrait automatique des inactifs. Couvre `site/js/ui.js`, `site/js/room-store.js` et les règles `participants` / `pseudos` de `database.rules.json`.

## Requirements

### Requirement: Salle unique
Le site SHALL proposer une seule salle de poker planning, commune à tous les participants et accessible directement à l'adresse du site. Le site MUST NOT demander de créer une salle, de saisir un code ni de créer un compte.

#### Scenario: Arrivée par le lien
- **GIVEN** deux personnes qui ouvrent l'adresse du site sur deux ordinateurs différents
- **WHEN** elles ont choisi leur pseudo
- **THEN** elles se retrouvent dans la même salle et se voient mutuellement dans la liste des présents

### Requirement: Rejoindre avec un téléphone
Sur un écran large (760 px et plus), la salle SHALL afficher en permanence une carte « Rejoindre avec un téléphone » avec un QR code de l'adresse du site (sans paramètre ni ancre) et l'adresse en clair, sans gêner la liste des présents, les cartes ni les résultats. Un clic sur le QR code SHALL l'afficher en grand au centre de l'écran ; la touche Échap, un clic en dehors ou un bouton « Fermer » SHALL le refermer. Le QR code SHALL rester lisible en thème sombre (modules sombres sur fond clair). Sur un écran étroit, le QR code MUST NOT être affiché ; un bouton « Partager le lien » SHALL ouvrir le partage du téléphone, ou à défaut copier l'adresse et le confirmer. Le générateur de QR code SHALL être embarqué dans le site, sans chargement depuis un service externe.

#### Scenario: Retardataire en réunion
- **GIVEN** l'animateur qui partage son écran d'ordinateur, salle ouverte
- **WHEN** un retardataire scanne le QR code de la carte « Rejoindre avec un téléphone »
- **THEN** son téléphone ouvre l'adresse du site et il peut choisir son pseudo

#### Scenario: QR code agrandi
- **GIVEN** la salle sur un ordinateur
- **WHEN** l'utilisateur clique sur le QR code, puis appuie sur Échap
- **THEN** le QR code s'affiche en grand au centre de l'écran, puis se referme

#### Scenario: Sur téléphone
- **GIVEN** la salle sur un téléphone de 390 px de large
- **WHEN** elle s'affiche
- **THEN** aucun QR code n'est visible, et un bouton « Partager le lien » est proposé

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

### Requirement: Activité des participants
L'heure de la dernière activité d'un participant SHALL être mesurée par l'horloge du serveur temps réel. Comptent comme activité : l'arrivée dans la salle, le vote, le retrait de vote, « Révéler », « Nouveau vote », le changement de pseudo, et toute interaction avec la page (souris, clavier, écran tactile) pendant que l'onglet est affiché à l'écran. L'activité due aux seules interactions SHALL être enregistrée au plus une fois toutes les 5 minutes. Un participant sans activité depuis plus de 20 minutes SHALL être considéré comme inactif.

#### Scenario: Participant qui suit une longue discussion
- **GIVEN** Marc, qui n'a ni voté ni cliqué depuis 25 minutes mais a bougé la souris sur l'onglet affiché il y a 3 minutes
- **WHEN** l'inactivité est évaluée
- **THEN** Marc est actif

#### Scenario: Onglet oublié en arrière-plan
- **GIVEN** Paul, dont l'onglet est resté en arrière-plan sans aucune action depuis 2 heures
- **WHEN** l'inactivité est évaluée
- **THEN** Paul est inactif

### Requirement: Retrait automatique des inactifs
Les participants inactifs SHALL être retirés automatiquement de la salle, sans action de personne : chaque navigateur présent dans la salle SHALL vérifier au moins une fois par minute s'il y a des participants inactifs et les retirer. Un retiré disparaît de la liste, son vote n'est plus compté et son pseudo est libéré. Un participant MUST NOT se retirer lui-même ni retirer un participant actif. Les règles de sécurité du service temps réel MUST n'autoriser à retirer un autre participant que s'il est inactif depuis plus de 20 minutes selon l'horloge du serveur. Un participant retiré dont l'onglet est encore ouvert SHALL voir « Vous avez été retiré de la salle pour inactivité » avec le bouton « Revenir dans la salle ».

#### Scenario: Retrait automatique
- **GIVEN** Julie et Marc actifs dans la salle, et Paul inactif depuis 2 heures
- **WHEN** une minute s'écoule
- **THEN** Paul a disparu de la liste de Julie et de Marc, sans que personne n'ait cliqué

#### Scenario: Retour d'un participant retiré
- **GIVEN** Paul retiré pour inactivité, son onglet toujours ouvert
- **WHEN** il revient sur son onglet
- **THEN** il voit « Vous avez été retiré de la salle pour inactivité » et peut revenir dans la salle sous son pseudo, sans le ressaisir

### Requirement: Rechargement et onglets multiples
Recharger la page MUST NOT faire perdre au participant son pseudo ni son vote du tour en cours. Plusieurs onglets ouverts dans le même navigateur SHALL représenter un seul participant, présent tant qu'au moins un onglet est ouvert.

#### Scenario: Rechargement pendant un vote
- **GIVEN** Marc qui a voté 5, cartes non révélées
- **WHEN** il recharge la page
- **THEN** il revient dans la salle sous le pseudo « Marc » avec sa carte 5 sélectionnée, et les autres le voient toujours comme ayant voté
