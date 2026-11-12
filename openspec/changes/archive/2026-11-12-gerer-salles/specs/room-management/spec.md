## ADDED Requirements

### Requirement: Salles indépendantes
Le site SHALL proposer plusieurs salles de poker planning. Chaque salle SHALL avoir sa propre adresse, ses présents, ses pseudos, ses votes, son état de révélation et son réglage de révélation automatique : rien de ce qui se passe dans une salle MUST NOT apparaître dans une autre. Le site MUST NOT demander de compte.

#### Scenario: Deux équipes en même temps
- **GIVEN** Julie dans la salle « Produit » et Marc dans la salle « Tech »
- **WHEN** Julie vote 5 puis clique sur « Révéler »
- **THEN** Marc ne voit ni Julie, ni son vote, ni la révélation, et ses propres cartes restent cachées

### Requirement: Lister les salles
L'adresse du site SHALL ouvrir la liste des salles actives, triée par ordre alphabétique sans tenir compte de la casse ni des accents, avec pour chacune le nombre de participants présents (« 3 présents », « Personne »). Chaque salle de la liste SHALL ouvrir la salle. La liste SHALL se mettre à jour sans recharger la page quand une salle est créée, renommée, mise à la corbeille ou restaurée, ou quand ses présents changent. Sans salle, la page SHALL inviter à créer la première.

#### Scenario: Ouvrir une salle
- **GIVEN** les salles « Produit » et « Tech »
- **WHEN** un utilisateur ouvre l'adresse du site et choisit « Tech »
- **THEN** la salle « Tech » s'ouvre, à son adresse propre

#### Scenario: Nombre de présents
- **GIVEN** Julie et Marc dans la salle « Produit »
- **WHEN** Léa affiche la liste des salles
- **THEN** « Produit » indique « 2 présents »

### Requirement: Créer une salle
Le site SHALL permettre de créer une salle avec un nom de 1 à 50 caractères. Les espaces en début et fin SHALL être retirés et les espaces multiples réduits à un seul. Le nom MUST être unique sans tenir compte de la casse, des accents ni des espaces en trop, y compris parmi les salles de la corbeille. Cette unicité MUST être appliquée aussi par les règles de sécurité du service temps réel. Après la création, la nouvelle salle SHALL s'ouvrir.

#### Scenario: Création réussie
- **WHEN** un utilisateur crée la salle « Produit »
- **THEN** la salle « Produit » s'ouvre, et elle apparaît dans la liste des salles de tous les navigateurs

#### Scenario: Nom déjà utilisé
- **GIVEN** une salle « Été » existe
- **WHEN** un utilisateur crée la salle « ete »
- **THEN** la création est refusée avec le message « Une salle « Été » existe déjà. »

#### Scenario: Nom réservé par une salle de la corbeille
- **GIVEN** la salle « Produit » est dans la corbeille
- **WHEN** un utilisateur crée la salle « Produit »
- **THEN** la création est refusée avec le message « Une salle « Produit » existe déjà dans la corbeille. »

#### Scenario: Nom vide
- **WHEN** un utilisateur crée une salle dont le nom ne contient que des espaces
- **THEN** la création est refusée avec le message « Le nom de la salle est obligatoire. »

### Requirement: Renommer une salle
Depuis une salle active, le site SHALL permettre de la renommer, avec les mêmes règles de longueur et d'unicité qu'à la création. Changer seulement la casse SHALL être permis. Le renommage MUST conserver l'adresse de la salle, ses présents et le vote en cours, et SHALL libérer l'ancien nom.

#### Scenario: Renommage pendant un vote
- **GIVEN** la salle « Produit », Marc ayant voté 3, cartes non révélées
- **WHEN** Julie la renomme en « Produit & Design »
- **THEN** tous les présents voient le nouveau nom, le vote de Marc est conservé, et le nom « Produit » redevient disponible

### Requirement: Corbeille des salles
Mettre une salle à la corbeille SHALL demander une confirmation qui indique le nombre d'autres participants présents. Une salle dans la corbeille SHALL disparaître de la liste, se fermer pour ses présents et perdre ses présents et ses votes, mais garder son nom, son adresse et son réglage de révélation automatique. Une page « Corbeille » SHALL lister ces salles, des plus récemment supprimées aux plus anciennes, avec la date de suppression.

#### Scenario: Mise à la corbeille pendant une session
- **GIVEN** Julie et Marc dans la salle « Produit »
- **WHEN** Julie la met à la corbeille et confirme
- **THEN** Julie revient à la liste des salles, Marc voit « Cette salle a été mise à la corbeille. » avec un lien vers la liste, et « Produit » apparaît dans la corbeille

### Requirement: Restauration et suppression définitive
Une salle de la corbeille SHALL pouvoir être restaurée, à la même adresse, ou supprimée définitivement après confirmation, ce qui libère son nom.

#### Scenario: Restauration
- **GIVEN** la salle « Produit » dans la corbeille
- **WHEN** un utilisateur la restaure
- **THEN** elle réapparaît dans la liste, vide, et son ancien lien et son QR code l'ouvrent de nouveau

#### Scenario: Suppression définitive
- **GIVEN** la salle « Produit » dans la corbeille
- **WHEN** un utilisateur la supprime définitivement et confirme
- **THEN** la salle est effacée, et le nom « Produit » redevient disponible

#### Scenario: Lien vers une salle absente
- **GIVEN** la salle « Produit » dans la corbeille ou supprimée
- **WHEN** un utilisateur ouvre son lien
- **THEN** la page indique que la salle est introuvable ou dans la corbeille, avec un lien vers la liste des salles

### Requirement: Salle de la corbeille fermée par la base
Les règles de sécurité MUST refuser toute arrivée, tout vote et tout changement de réglage ou de nom dans une salle de la corbeille, et MUST refuser la suppression définitive d'une salle qui n'y est pas.

#### Scenario: Vote dans une salle de la corbeille
- **GIVEN** la salle « Produit » dans la corbeille
- **WHEN** un navigateur tente d'y voter
- **THEN** la base refuse l'écriture

#### Scenario: Suppression définitive d'une salle active
- **GIVEN** la salle « Produit » active
- **WHEN** un navigateur tente de la supprimer définitivement
- **THEN** la base refuse l'écriture
