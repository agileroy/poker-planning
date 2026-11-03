## Why

Le fichier de règles commun au projet Firebase partagé (`poker-planning-vleroy`) se publie à la main dans la console, à chaque évolution. Pendant le déplacement des outils vers leurs propres projets, il change à chaque étape (une branche retirée par outil déplacé) : la publication manuelle devient une source d'oubli et de décalage entre les dépôts et la base réelle.

## What Changes

- **Publication automatique du fichier commun depuis ce dépôt** : à chaque push sur `main`, après les tests, GitHub Actions publie `database.rules.json` dans le projet partagé, avec un compte de service de ce projet gardé dans le secret `FIREBASE_SERVICE_ACCOUNT` du dépôt `poker-planning` ; le site n'est publié qu'après les règles. Sans secret, le job est sauté avec un avertissement.
- `firebase.json` et `.firebaserc` désignent le projet partagé.
- Le fichier reste identique dans les dépôts qui partagent encore la base ; seul `poker-planning` le publie. Toute évolution du fichier commun passe donc par un push sur `poker-planning`. Ce dépôt est le bon hôte : le projet porte son nom, et le poker planning le gardera comme projet propre une fois les autres outils déplacés.

Hors périmètre : déplacement des autres outils dans leurs propres projets (un changement par outil, dans leur dépôt).

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `site-publication` : le fichier de règles commun est publié automatiquement depuis ce dépôt.

## Impact

- `poker-planning` : `firebase.json`, `.firebaserc` (nouveaux), `.github/workflows/pages.yml`, `tests/rules.test.mjs` (nouveau), `README.md`, `openspec/config.yaml`.
- `roti` : le job de publication préparé un temps dans ce dépôt est retiré ; son README renvoie vers `poker-planning`.
- Action manuelle de l'auteur : générer une clé de compte de service du projet `poker-planning-vleroy` et créer le secret `FIREBASE_SERVICE_ACCOUNT` dans le dépôt `poker-planning` (fait).
