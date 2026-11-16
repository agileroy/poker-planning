## MODIFIED Requirements

### Requirement: Copier le lien depuis la salle
Dans la carte « Rejoindre avec un téléphone », une icône de copie SHALL suivre l'adresse de la salle. Un clic SHALL copier l'adresse courte dans le presse-papiers, changer l'icône en coche et afficher « Lien copié » pendant quelques secondes. Si le navigateur refuse la copie, l'adresse SHALL être affichée dans un message pour une copie manuelle. L'en-tête de la salle MUST NOT répéter l'adresse ni proposer de bouton de copie.

#### Scenario: Copier le lien en réunion
- **GIVEN** l'animateur sur ordinateur dans la salle « Produit », de code `kfqz`
- **WHEN** il clique sur l'icône de copie à côté de l'adresse, dans la carte du QR code
- **THEN** le presse-papiers contient `https://agileroy.github.io/poker-planning/#kfqz`, l'icône devient une coche et « Lien copié » s'affiche
