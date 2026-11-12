## MODIFIED Requirements

### Requirement: Règles de sécurité versionnées
Les règles de sécurité de la base Firebase SHALL être versionnées dans le dépôt (`database.rules.json`). Elles MUST imposer, dans chaque salle, qu'un participant identifié ne modifie que sa propre présence et son propre vote, n'écrive que des valeurs de carte valides, et ne vote pas une fois les cartes révélées. Elles MUST aussi imposer l'unicité des noms de salle et refuser toute écriture qui ferait entrer, voter ou régler quoi que ce soit dans une salle absente ou mise à la corbeille.

#### Scenario: Écriture du vote d'un autre
- **GIVEN** Marc connecté
- **WHEN** son navigateur tente d'écrire le vote de Julie
- **THEN** la base refuse l'écriture

#### Scenario: Vote dans une salle de la corbeille
- **GIVEN** la salle « Produit » dans la corbeille
- **WHEN** un navigateur tente d'y écrire un vote ou une présence
- **THEN** la base refuse l'écriture
