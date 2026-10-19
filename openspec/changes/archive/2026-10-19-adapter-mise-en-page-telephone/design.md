## Context

La salle est une grille CSS : liste des présents, colonne `.side` (carte QR et résultats), puis jeu de cartes sur toute la largeur. Sur écran étroit, tout est empilé dans l'ordre du HTML.

## Decisions

- **Ordre** : propriété CSS `order` sous 760 px (jeu de cartes, puis `.side`, puis liste), sans changer l'ordre du HTML, qui reste celui de la lecture sur grand écran et des lecteurs d'écran. La carte QR est déjà masquée sous 760 px.
- **Vibration** : `navigator.vibrate?.(150)` quand la vue passe de « non révélé » à « révélé » entre deux rendus ; le premier rendu ne vibre jamais. Appel protégé par `try/catch`. Safari sur iPhone n'implémente pas l'API : pas de vibration, sans erreur.

## Risks / Trade-offs

- [Ordre visuel différent de l'ordre du HTML sur téléphone] → La navigation au clavier suit l'ordre du HTML ; acceptable sur téléphone, où l'on utilise le toucher.
