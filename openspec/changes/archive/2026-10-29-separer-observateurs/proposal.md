## Why

Les observateurs (PO, Scrum Master, invités) apparaissent mélangés aux votants dans la liste des présents. Avec plusieurs observateurs, la liste s'allonge et il devient difficile de voir d'un coup d'œil qui a voté.

## What Changes

- La liste des présents ne montre plus que les participants qui votent.
- Les observateurs sont regroupés dans un encadré « Observateurs » à part : sous le QR code sur ordinateur (espace jusqu'ici vide), après la liste des présents sur téléphone.
- L'encadré n'apparaît que s'il y a au moins un observateur ; il indique leur nombre.
- Quand tout le monde observe, la liste des présents affiche « Aucun votant pour l'instant. ».

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `voting-round` : exigence « Mode observateur » (place des observateurs dans la salle).
- `site-publication` : exigence « Mise en page sur téléphone » (encadré des observateurs en dernier).

## Impact

- `site/js/poker-core.js` (listes des votants et des observateurs dans la vue), `site/js/ui.js`, `site/index.html`, `site/app.css`, tests.
- Aucune modification des données ni des règles Firebase.
