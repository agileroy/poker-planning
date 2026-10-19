# poker-planning

Poker planning de l'équipe, sans publicité.

**Site : https://vinchou59.github.io/poker-planning/**

Cartes : `?` · `0` · `1` · `2` · `3` · `5` · `8` · ✂️ (ciseaux : story à découper)

## Fonctionnement

- Une **salle unique** pour toute l'équipe : on ouvre le lien, on choisit un pseudo, on est dans la salle. Pas de compte.
- Le pseudo est **unique** dans la salle et **mémorisé** dans le navigateur ; « Changer de pseudo » permet d'en changer.
- La liste des **présents** se met à jour en temps réel.
- Les votes des autres restent **cachés** (carte de dos) jusqu'à ce que quelqu'un clique sur **Révéler**. On peut changer ou retirer son vote jusque-là ; après, les votes sont figés.
- **Nouveau vote** efface tous les votes et recommence un tour, pour tout le monde.
- Après la révélation : répartition, moyenne (sans `?` ni ✂️), consensus quand tout le monde a la même carte, alerte « Story à découper ? » si une carte ✂️ a été jouée.

## Architecture

Site statique (HTML/CSS/JavaScript, sans build) publié sur GitHub Pages ; l'état partagé de la salle est dans Firebase Realtime Database (connexion anonyme).

- `site/js/poker-core.js` : logique métier pure (cartes, pseudo, vue de la salle, résultats), testée avec Node.js ;
- `site/js/room-store.js` : seul module qui parle à Firebase ;
- `site/js/ui.js` : interface ; `site/js/app.js` : point d'entrée ;
- `site/js/firebase-config.js` : configuration web Firebase (publique par nature) ;
- `database.rules.json` : règles de sécurité de la base, à publier dans la console Firebase après chaque modification.

## Développement

```sh
npm test                                          # tests de la logique métier
python3 -m http.server 8765 --directory site      # puis http://localhost:8765
```

Chaque push sur `main` lance les tests puis publie `site/` sur GitHub Pages ; un test en échec bloque la publication.

## Méthode

Le projet suit le développement piloté par les spécifications avec [OpenSpec](https://github.com/Fission-AI/OpenSpec) : `openspec/specs/` décrit le comportement attendu, `openspec/changes/` les changements en cours. Commandes Claude Code : `/opsx:explore`, `/opsx:propose`, `/opsx:apply`, `/opsx:archive`.
