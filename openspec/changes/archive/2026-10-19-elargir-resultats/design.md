## Decisions

- Les résultats deviennent un enfant direct de la grille `.room` (après la colonne `.side`, qui ne contient plus que la carte « Rejoindre »), avec `grid-column: 1 / -1` sur écran large.
- Contenu réparti dans `.results-figures` et `.results-messages` ; grille à deux colonnes activée seulement si un message est visible (`.results:has(.results-messages > :not([hidden]))`), sinon une seule colonne.
- Téléphone : l'ordre `order` existant vise désormais `#results` au lieu de `.side` ; `.side` est masquée sous 760 px (la carte « Rejoindre » l'était déjà).
