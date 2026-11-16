## Why

Retour d'usage sur les salles : leur lien (`…/poker-planning/#/room/k3x9q2m7a0bz`) est trop long pour être dicté ou tapé en réunion, et le copier demande de le sélectionner à la main (sur ordinateur, seul le QR code et l'adresse en clair sont proposés).

## What Changes

- Une nouvelle salle reçoit un **code de 4 lettres** (`a` à `z`), et son lien devient `…/poker-planning/#abcd`. Le code est unique ; il est insensible à la casse quand on le tape (`#ABCD` ouvre la salle `abcd`).
- Bouton **« Copier le lien »** dans l'en-tête de chaque salle, sur ordinateur comme sur téléphone, et dans chaque ligne de la liste des salles : un clic copie le lien et le confirme (« Lien copié »).
- Les salles déjà créées gardent leur identifiant de 12 caractères et leur lien (`#/room/<id>`), qui continue de fonctionner. Pour leur donner un lien court, il suffit de les recréer (corbeille, suppression définitive, nouvelle création sous le même nom).
- Les liens `#/room/abcd` et `#/abcd` restent acceptés et sont réécrits en `#abcd`.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `room-management` : identifiant de salle de 4 lettres, lien court, copie du lien depuis la liste.
- `participant-presence` : copie du lien depuis la salle ; QR code et partage avec le lien court.
- `site-publication` : les règles acceptent les identifiants de 4 lettres (et ceux de 12 caractères déjà créés).

## Impact

- `site/js/poker-core.js` (identifiants, lien d'une salle), `site/js/ui.js` (routage), `site/js/lobby.js`, `site/js/room-ui.js`, `site/js/widgets.js` (copie), `site/index.html`, `site/app.css`.
- `database.rules.json` : motif de `$roomId`.
- Tests : `tests/rooms.test.mjs`, `tests/rules.test.mjs`.
