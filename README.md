# poker-planning

Poker planning de l'équipe, sans publicité.

**Site : https://agileroy.github.io/poker-planning/**

Cartes : `?` · `0` · `1` · `2` · `3` · `5` · `8` · ✂️ (ciseaux : story à découper)

## Fonctionnement

- Une **salle unique** pour toute l'équipe : on ouvre le lien, on choisit un pseudo, on est dans la salle. Pas de compte.
- Sur ordinateur, un **QR code** permet de rejoindre depuis un téléphone (clic pour l'agrandir) ; sur téléphone, **Partager le lien**.
- Le pseudo est **unique** dans la salle et **mémorisé** dans le navigateur ; « Changer de pseudo » permet d'en changer.
- La liste des **présents** se met à jour en temps réel.
- Les votes des autres restent **cachés** (carte de dos) jusqu'à ce que quelqu'un clique sur **Révéler**. On peut changer ou retirer son vote jusque-là ; après, les votes sont figés.
- **Nouveau vote** efface tous les votes et recommence un tour, pour tout le monde.
- **Quitter** retire de la salle ; les participants inactifs depuis plus de 20 minutes (onglet oublié) sont retirés automatiquement.
- Après la révélation : répartition, moyenne (sans `?` ni ✂️), consensus quand tout le monde a la même carte, alerte « Story à découper ? » si une carte ✂️ a été jouée.

## Réseau d'entreprise

Le VPN de l'entreprise (proxy Zscaler) bloque GitHub Pages et Firebase : rejoindre la salle depuis un téléphone, hors VPN.

## Architecture

Site statique (HTML/CSS/JavaScript, sans build) publié sur GitHub Pages ; l'état partagé de la salle est dans Firebase Realtime Database (connexion anonyme).

- `site/js/poker-core.js` : logique métier pure (cartes, pseudo, vue de la salle, résultats), testée avec Node.js ;
- `site/js/room-store.js` : seul module qui parle à Firebase ;
- `site/js/ui.js` : interface ; `site/js/app.js` : point d'entrée ;
- `site/js/firebase-config.js` : configuration web Firebase (publique par nature) ;
- `site/vendor/` : générateur de QR code `qrcode-generator` 1.4.4 (licence MIT) ;
- `database.rules.json` : règles de sécurité du projet Firebase `poker-planning-vleroy`, encore partagé avec d'autres outils (une branche par outil ; les outils déplacés dans leur propre projet, comme Fournée, n'y figurent plus). Le fichier doit rester identique dans tous les dépôts qui partagent la base, et **seul ce dépôt le publie** : à chaque push sur `main`, après les tests, le job `rules` du workflow le déploie (Firebase CLI, compte de service du secret `FIREBASE_SERVICE_ACCOUNT`, projet désigné par `firebase.json` et `.firebaserc`). Toute évolution du fichier commun se fait donc ici, puis se recopie dans les autres dépôts.

## Développement

```sh
npm test                                          # tests de la logique métier
python3 -m http.server 8765 --directory site      # puis http://localhost:8765
```

Chaque push sur `main` lance les tests, publie les règles de la base puis publie `site/` sur GitHub Pages ; un test en échec bloque les deux publications.

## Méthode

Le projet suit le développement piloté par les spécifications avec [OpenSpec](https://github.com/Fission-AI/OpenSpec) : `openspec/specs/` décrit le comportement attendu, `openspec/changes/` les changements en cours. Commandes Claude Code : `/opsx:explore`, `/opsx:propose`, `/opsx:apply`, `/opsx:archive`.
