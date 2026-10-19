## Why

L'équipe estime ses stories en poker planning avec des outils en ligne gratuits, chargés de publicités. Un outil maison, minimal et sans publicité, suffit à ses besoins : une salle unique où chacun vote en direct, y compris depuis un VPN d'entreprise.

## What Changes

- Une **salle unique** pour toute l'équipe, à l'adresse du site : pas de création de salle, pas de compte.
- À l'arrivée, chaque participant choisit un **pseudo**, unique dans la salle et mémorisé dans son navigateur : il n'a plus à le ressaisir les fois suivantes.
- La **liste des présents** se met à jour en temps réel quand quelqu'un arrive ou quitte la page.
- Jeu de cartes : `?`, `0`, `1`, `2`, `3`, `5`, `8` et une carte ✂️ (ciseaux, « story à découper »).
- Les votes des autres sont **cachés** (carte de dos) jusqu'à la révélation ; on voit seulement qui a voté. On peut changer ou retirer son vote tant que les cartes ne sont pas révélées.
- Un bouton **« Révéler »**, accessible à tous, retourne toutes les cartes ; les votes sont alors figés.
- Un bouton **« Nouveau vote »**, accessible à tous, remet tous les votes à zéro.
- Après la révélation : répartition des votes, moyenne des cartes chiffrées (hors `?` et ✂️), message de consensus, et alerte « story à découper ? » si une carte ✂️ a été jouée.
- Site statique publié sur GitHub Pages ; l'état partagé de la salle passe par Firebase (offre gratuite).

Hors périmètre de cette première version : plusieurs salles, titre de la story, historique des votes, mode observateur, révélation automatique, minuteur.

## Capabilities

### New Capabilities

- `participant-presence` : choix et mémorisation du pseudo, unicité, liste des présents en temps réel, rechargement et départ.
- `voting-round` : cartes, vote caché, changement de vote, révélation et nouveau vote.
- `vote-results` : répartition, moyenne, consensus et alerte ✂️ après la révélation.
- `site-publication` : tests et publication automatique sur GitHub Pages, configuration Firebase.

### Modified Capabilities

_Aucune._

## Impact

- Ajoutés : `site/` (page, styles, scripts, icône ✂️), `tests/`, `database.rules.json` (règles de sécurité Firebase), `.github/workflows/pages.yml`.
- Service tiers : un projet Firebase (Realtime Database et authentification anonyme), à créer par l'auteur avec son compte Google.
- Actions manuelles de l'auteur : création du projet Firebase, publication des règles, activation de GitHub Pages (source : GitHub Actions).
- `README.md` et contexte `openspec/config.yaml` mis à jour.
