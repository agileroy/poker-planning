## Decisions

- `buildRoomView` ajoute aux résultats `questionPseudos` (pseudos des votants présents ayant joué `?`, triés avec `localeCompare` français) ; le texte est produit par une fonction pure `questionMessage(pseudos)` (`Intl.ListFormat` français, accord singulier / pluriel), testée unitairement.
- Affichage : encadré d'information dans le panneau Résultats, avant l'alerte ciseaux, avec la carte « ? » en pastille. Style informatif (ni succès ni alerte) : une question est normale, pas un problème.
- La formule « avec elle ou lui » évite de supposer le genre à partir du pseudo.
