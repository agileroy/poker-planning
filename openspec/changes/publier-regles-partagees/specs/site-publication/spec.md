## ADDED Requirements

### Requirement: Publication automatique des règles partagées
Ce dépôt SHALL être le seul à publier le fichier de règles commun au projet partagé `poker-planning-vleroy`. À chaque push sur `main`, après la réussite des tests, GitHub Actions SHALL publier ce fichier dans le projet avec le compte de service du secret `FIREBASE_SERVICE_ACCOUNT`, puis seulement publier le site. Sans secret, la publication des règles SHALL être sautée avec un avertissement, sans empêcher la publication du site.

#### Scenario: Branche retirée après le déplacement d'un outil
- **GIVEN** un fichier commun dont on retire la branche d'un outil déplacé dans son propre projet
- **WHEN** la modification est poussée sur `main` de ce dépôt et que les tests réussissent
- **THEN** les règles du projet partagé sont mises à jour sans action dans la console

#### Scenario: Secret absent
- **GIVEN** un dépôt sans secret `FIREBASE_SERVICE_ACCOUNT`
- **WHEN** le workflow s'exécute sur `main`
- **THEN** le job des règles signale qu'il est sauté et le site est publié quand même
