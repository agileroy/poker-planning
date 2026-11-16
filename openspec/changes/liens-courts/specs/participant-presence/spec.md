## ADDED Requirements

### Requirement: Copier le lien depuis la salle
L'en-tête de la salle SHALL proposer, sur tous les écrans, un bouton « Copier le lien » qui copie l'adresse courte de la salle dans le presse-papiers en un clic et le confirme par « Lien copié » pendant quelques secondes. Si le navigateur refuse la copie, l'adresse SHALL être affichée pour une copie manuelle.

#### Scenario: Copier le lien en réunion
- **GIVEN** l'animateur dans la salle « Produit », de code `kfqz`
- **WHEN** il clique sur « Copier le lien »
- **THEN** le presse-papiers contient `https://agileroy.github.io/poker-planning/#kfqz`, et « Lien copié » s'affiche

## MODIFIED Requirements

### Requirement: Rejoindre avec un téléphone
Sur un écran large (760 px et plus), la salle SHALL afficher en permanence une carte « Rejoindre avec un téléphone » avec un QR code de l'adresse courte de la salle ouverte et cette adresse en clair, sans gêner la liste des présents, les cartes ni les résultats. Un clic sur le QR code SHALL l'afficher en grand au centre de l'écran ; la touche Échap, un clic en dehors ou un bouton « Fermer » SHALL le refermer. Le QR code SHALL rester lisible en thème sombre (modules sombres sur fond clair). Sur un écran étroit, le QR code MUST NOT être affiché ; un bouton « Partager le lien » SHALL ouvrir le partage du téléphone avec l'adresse de la salle, ou à défaut copier cette adresse et le confirmer. Le générateur de QR code SHALL être embarqué dans le site, sans chargement depuis un service externe.

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
- **THEN** aucun QR code n'est visible, et les boutons « Copier le lien » et « Partager le lien » sont proposés
