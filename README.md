# poker-planning

Poker planning des équipes, une salle par équipe, sans publicité.

**Site : https://agileroy.github.io/poker-planning/**

Cartes : `?` · `0` · `1` · `2` · `3` · `5` · `8` · ✂️ (ciseaux : story à découper)

## Fonctionnement

- **Une salle par équipe**, sur le modèle des équipes de la [roue de la chance](https://agileroy.github.io/wheel-of-chance/) : l'adresse du site ouvre la liste des salles (avec le nombre de présents), où l'on crée la sienne. Chaque salle a son adresse (`#/room/<identifiant>`), ses présents et ses votes. Pas de compte.
- Les noms de salle sont **uniques**, sans tenir compte des majuscules, des accents ni des espaces en trop. Une salle se **renomme** depuis la salle, sans changer d'adresse.
- Les salles supprimées passent par une **corbeille** : la salle se ferme et se vide pour ses présents ; on peut la restaurer (même lien, même QR code) ou la supprimer définitivement.
- Sur ordinateur, un **QR code** de la salle permet de la rejoindre depuis un téléphone (clic pour l'agrandir) ; sur téléphone, **Partager le lien**.
- Le pseudo est **unique** dans chaque salle et **mémorisé** dans le navigateur pour toutes les salles ; « Changer de pseudo » permet d'en changer.
- La liste des **présents** se met à jour en temps réel.
- Les votes des autres restent **cachés** (carte de dos) jusqu'à ce que quelqu'un clique sur **Révéler**. On peut changer ou retirer son vote jusque-là ; après, les votes sont figés.
- **Nouveau vote** efface tous les votes et recommence un tour, pour tout le monde.
- **Quitter**, ou revenir à la liste (« Toutes les salles », bouton Précédent), retire de la salle ; les participants inactifs depuis plus de 20 minutes (onglet oublié) sont retirés automatiquement.
- Après la révélation : répartition, moyenne (sans `?` ni ✂️), consensus quand tout le monde a la même carte, alerte « Story à découper ? » si une carte ✂️ a été jouée.

## Réseau d'entreprise

Le VPN de l'entreprise (proxy Zscaler) bloque GitHub Pages et Firebase : rejoindre la salle depuis un téléphone, hors VPN.

## Architecture

Site statique (HTML/CSS/JavaScript, sans build) publié sur GitHub Pages ; l'état partagé des salles est dans Firebase Realtime Database (connexion anonyme), sous `rooms/<identifiant>`, les noms réservés sous `roomNames`.

- `site/js/poker-core.js` : logique métier pure (cartes, pseudo, vue de la salle, résultats, noms et écritures des salles), testée avec Node.js ;
- `site/js/room-store.js` : seul module qui parle à Firebase ;
- `site/js/ui.js` : routage (une page n'ouvre qu'une salle : en changer recharge la page, après l'avoir quittée) ; `site/js/lobby.js` : liste des salles et corbeille ; `site/js/room-ui.js` : la salle ; `site/js/widgets.js` : utilitaires d'interface ; `site/js/app.js` : point d'entrée ;
- `site/js/firebase-config.js` : configuration web Firebase (publique par nature) ;
- `site/vendor/` : générateur de QR code `qrcode-generator` 1.4.4 (licence MIT) ;
- `database.rules.json` : règles de sécurité du projet Firebase `poker-planning-vleroy`, propre au poker planning (les autres outils ont chacun leur projet), limitées aux branches `rooms` et `roomNames`. Elles sont publiées automatiquement à chaque push sur `main`, après les tests, par le job `rules` du workflow (Firebase CLI, compte de service du secret `FIREBASE_SERVICE_ACCOUNT`, projet désigné par `firebase.json` et `.firebaserc`).

## Développement

```sh
npm test                                          # tests de la logique métier et des règles (simulées)
python3 -m http.server 8765 --directory site      # puis http://localhost:8765
```

Chaque push sur `main` lance les tests, publie les règles de la base puis publie `site/` sur GitHub Pages ; un test en échec bloque les deux publications.

## Méthode

Le projet suit le développement piloté par les spécifications avec [OpenSpec](https://github.com/Fission-AI/OpenSpec) : `openspec/specs/` décrit le comportement attendu, `openspec/changes/` les changements en cours. Commandes Claude Code : `/opsx:explore`, `/opsx:propose`, `/opsx:apply`, `/opsx:archive`.
