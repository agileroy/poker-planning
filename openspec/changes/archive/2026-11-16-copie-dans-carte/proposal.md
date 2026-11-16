## Why

Retour d'usage : le lien et le bouton « Copier le lien » ajoutés dans l'en-tête de la salle font doublon avec la carte « Rejoindre avec un téléphone », qui affiche déjà le QR code et l'adresse. L'en-tête est surchargé.

## What Changes

- L'en-tête de la salle redevient sobre : nom, « Toutes les salles », « Renommer », « Mettre à la corbeille ».
- La copie du lien se fait par une petite icône à côté de l'adresse, dans la carte du QR code ; l'icône devient une coche et « Lien copié » s'affiche.
- Sur téléphone (sans carte QR code), « Partager le lien » reste le moyen de transmettre le lien (partage du téléphone, ou copie à défaut). La copie depuis la liste des salles est inchangée.

## Capabilities

### Modified Capabilities

- `participant-presence` : « Copier le lien depuis la salle » passe dans la carte du QR code.

## Impact

`site/index.html`, `site/app.css`, `site/js/room-ui.js`.
