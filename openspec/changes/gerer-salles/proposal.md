## Why

Le poker planning n'a qu'une salle, commune à tous. Il sert désormais à plusieurs équipes : deux équipes qui estiment en même temps se retrouveraient dans la même salle, avec les mêmes votes, la même révélation et le même « Nouveau vote ». Chaque équipe doit avoir sa propre salle, comme chaque équipe a sa propre roue dans la roue de la chance.

## What Changes

- **Plusieurs salles**, sans compte, sur le modèle des équipes de la roue de la chance : la page d'accueil liste les salles (ordre alphabétique, nombre de présents), permet d'en créer une et d'ouvrir chacune. Une salle a sa propre adresse (`#/room/<identifiant>`), ses présents, ses votes, sa révélation automatique.
- **Noms de salle uniques** (1 à 50 caractères), sans tenir compte de la casse, des accents ni des espaces en trop, y compris parmi les salles de la corbeille ; unicité appliquée aussi par les règles de la base.
- **Renommer** une salle, depuis la salle, sans changer son adresse ni interrompre le vote.
- **Corbeille** : mettre une salle à la corbeille (avec confirmation) la ferme pour tout le monde et la vide de ses présents et de ses votes ; elle peut être restaurée, avec la même adresse, ou supprimée définitivement.
- **BREAKING** — la salle unique disparaît : l'adresse du site ouvre la liste des salles. Le QR code et « Partager le lien » donnent l'adresse de la salle ouverte.
- Le pseudo reste mémorisé dans le navigateur et sert dans toutes les salles ; il est unique dans chaque salle.
- Revenir à la liste des salles depuis une salle revient à la quitter.

Hors périmètre : protection d'une salle par mot de passe, droits d'administration, historique des votes.

## Capabilities

### New Capabilities

- `room-management` : création, renommage, liste et corbeille des salles.

### Modified Capabilities

- `participant-presence` : la salle unique devient une salle parmi d'autres ; QR code, pseudo et sortie se rapportent à la salle ouverte.
- `site-publication` : les règles de sécurité couvrent plusieurs salles et la corbeille.

## Impact

- `database.rules.json` : la branche `room` est remplacée par `rooms/<identifiant>` et `roomNames`.
- `site/js/poker-core.js` (noms et écritures des salles), `site/js/room-store.js`, `site/js/ui.js` (routage), `site/js/lobby.js` (nouveau : liste et corbeille), `site/js/room-ui.js` (salle, issue de `ui.js`), `site/index.html`, `site/app.css`.
- Tests : `tests/poker-core.test.mjs`, `tests/rules.test.mjs`.
- Données : le contenu de l'ancienne branche `room` (présents et votes du moment) n'est pas repris ; il devient inaccessible et peut être effacé dans la console Firebase.
