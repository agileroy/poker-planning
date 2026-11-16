## ADDED Requirements

### Requirement: Identifiants de salle acceptés par la base
Les règles de sécurité MUST n'accepter que deux formes d'identifiant de salle : 4 lettres minuscules (salles créées depuis ce changement) ou 12 caractères `[a-z0-9]` (salles créées avant).

#### Scenario: Identifiant invalide
- **WHEN** un navigateur tente de créer une salle d'identifiant `AB12`
- **THEN** la base refuse l'écriture
