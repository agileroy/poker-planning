## Décisions

- **Deux palettes, mêmes composants.** `:root` porte la palette claire, `:root[data-theme="dark"]` la palette néon de nuit. Toutes les couleurs propres à l'ambiance (cartes, machine à sous, LED, ampoules, bouton secondaire) passent par des variables.
- **Halos.** Toujours des couleurs néon vives (`--neon-pink`, `--neon-cyan`, `--neon-gold`, `--neon-orange`, `--neon-green`, en composantes RVB), dont l'intensité est réglée par `--halo` : 1 en sombre, 0,45 en clair. Le texte, lui, utilise les couleurs foncées du thème clair (`--pink` #c81d68, `--accent` #00798c, `--gold` #8a5d00, `--orange` #b14c00), toutes à 4,5:1 ou plus sur blanc.
- **Bouton de thème et script de tête** : repris tels qu'ils étaient avant `ambiance-casino-neon` (même clé `poker-planning.theme`) ; un choix mémorisé avant cette suppression s'applique de nouveau.
