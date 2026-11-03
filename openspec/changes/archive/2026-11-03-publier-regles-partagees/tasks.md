## 1. Préparation (auteur)

- [x] 1.1 Générer une clé de compte de service du projet `poker-planning-vleroy` et créer le secret `FIREBASE_SERVICE_ACCOUNT` dans le dépôt `poker-planning`. Vérification : secret listé dans les paramètres du dépôt. Fait le 3 novembre 2026.

## 2. Dépôt

- [x] 2.1 Ajouter `firebase.json`, `.firebaserc` (projet `poker-planning-vleroy`) et le job `rules` du workflow (après les tests, site publié après les règles, sauté sans secret) ; `tests/rules.test.mjs` (branche `room` présente, racine fermée, `firebase.json` et `.firebaserc`). Vérification : `npm test` au vert.
- [x] 2.2 Mettre à jour `README.md` et `openspec/config.yaml` ; retirer de `roti` le job de publication préparé un temps. Vérification : plus de mention d'une publication manuelle.
- [x] 2.3 Pousser sur `main`. Vérification : job `rules` « released successfully » et branche `incrementGame` absente des règles publiées. Fait le 3 novembre 2026 (commit 2148fed).
