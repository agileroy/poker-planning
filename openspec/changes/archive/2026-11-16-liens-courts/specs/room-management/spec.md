## ADDED Requirements

### Requirement: Lien court
Une salle créée SHALL recevoir un code de 4 lettres minuscules (`a` à `z`), unique parmi toutes les salles, corbeille comprise, qui sert d'adresse : `…/poker-planning/#<code>`. Le code MUST NOT changer au renommage ni à la restauration.

#### Scenario: Nouvelle salle
- **WHEN** un utilisateur crée la salle « Produit »
- **THEN** elle s'ouvre à une adresse de la forme `…/poker-planning/#kfqz`

### Requirement: Variantes du lien et anciennes salles
Ouvrir l'adresse avec le code en majuscules, ou sous la forme `#/<code>` ou `#/room/<code>`, SHALL ouvrir la même salle et afficher l'adresse sous sa forme courte. Les salles créées avant les liens courts SHALL garder leur identifiant de 12 caractères et leur adresse `#/room/<identifiant>`.

#### Scenario: Code tapé en majuscules
- **GIVEN** la salle de code `kfqz`
- **WHEN** un utilisateur ouvre `…/poker-planning/#KFQZ`
- **THEN** la salle s'ouvre, et l'adresse affichée devient `…/poker-planning/#kfqz`

#### Scenario: Ancienne salle
- **GIVEN** une salle créée avec l'identifiant `k3x9q2m7a0bz`
- **WHEN** un utilisateur ouvre son ancien lien `#/room/k3x9q2m7a0bz`
- **THEN** la salle s'ouvre

### Requirement: Copier le lien depuis la liste
Chaque salle de la liste SHALL proposer un bouton « Copier le lien » qui, en un clic et sans ouvrir la salle, copie son adresse dans le presse-papiers et le confirme par « Lien de « <nom> » copié ».

#### Scenario: Copie depuis la liste
- **GIVEN** la salle « Produit » dans la liste
- **WHEN** un utilisateur clique sur son bouton « Copier le lien »
- **THEN** l'adresse de la salle est dans le presse-papiers, la confirmation s'affiche, et la liste reste affichée
