## Context

`buildRoomView` renvoie tous les présents dans `participants`, triés par pseudo, chacun avec `observer`. L'interface affiche la liste dans le panneau « Présents » ; la colonne de droite (`.side`) ne contient que la carte QR code, masquée sur téléphone avec toute la colonne.

## Decisions

- **Vue** : `buildRoomView` ajoute `voters` (présents qui votent) et `observers` (présents qui observent), dans l'ordre alphabétique de `participants`, qui reste inchangé pour les autres calculs.
- **Interface** : la liste « Présents » est construite à partir de `voters` ; un nouveau panneau « Observateurs » (`#observers-panel`), placé dans `.side` sous la carte QR code, affiche les pseudos sous forme d'étiquettes compactes (« vous » pour soi), avec leur nombre. Panneau masqué sans observateur.
- **Téléphone** : `.side` n'est plus masquée en entier ; seule la carte QR code l'est (déjà le cas), et `.side` passe en dernier (`order: 4`), après la liste des présents.
- **Compteur** : inchangé (« 1 / 2 vote · 1 observateur »).

## Risks / Trade-offs

- [Sur ordinateur, panneau « Présents » plus court que la colonne de droite quand il y a beaucoup d'observateurs] → acceptable : les étiquettes sont compactes et passent à la ligne.
