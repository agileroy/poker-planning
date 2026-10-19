## Decisions

- **Couleurs** : jetons CSS par message (`--gap-*` orange, `--question-*` rouge, `--scissors-*` violet : fond, bordure, titre, texte, pastille), redéfinis pour le thème sombre sous `:root[data-theme="dark"]`. Valeurs issues des rampes ambre, rouge et violet (fond 50 / bordure 400-600 / titre 800 / texte 600 en clair ; fond 900 / bordure 200-400 / titre 50 / texte 100-200 en sombre).
- **Composant commun** `.alert-card` (encadré) + `.alert-icon` (pastille 36 px) + `.alert-title` / `.alert-text`, avec une variante de couleur par message.
- **Icônes** : SVG en ligne dessinés pour le projet (bulles, point d'interrogation) et l'icône ciseaux existante (`img/scissors.svg` en masque CSS), en blanc, `aria-hidden="true"`. Pas de bibliothèque d'icônes, conformément à l'objectif de ne rien charger de l'extérieur.
- `questionMessage` renvoie `{ title, text }` au lieu d'une phrase unique.
