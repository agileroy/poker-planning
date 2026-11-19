## Contexte

Maquette retenue : « B · Néon Vegas » (canvas de design du 19 novembre 2026). Site statique sans build ; aucun service tiers autorisé.

## Décisions

- **Thème sombre unique.** Les variables CSS de `:root` deviennent la palette néon ; le bloc `[data-theme="dark"]`, le script d'initialisation en tête de `index.html`, le bouton et `theme.js` sont supprimés. Les anciens choix mémorisés (`poker-planning.theme`) sont simplement ignorés.
- **Palette.** Fond `#0c0716`, surfaces violet nuit ; néons rose `#ff4fa3` (action principale), cyan `#3ff0ff` (sélection, liens), jaune `#ffd84a` (titres, médiane), orange `#ff9a3c` (écart), vert `#5dff9d` (consensus). Chaque texte garde un contraste d'au moins 4,5:1 sur son fond ; le halo (`text-shadow`, `box-shadow`) est décoratif.
- **Polices.** Monoton (titres d'enseigne : marque, nom de la salle) et Chakra Petch 400/600/700 (tout le reste), fichiers `woff2` sous-ensemble latin copiés depuis les paquets Fontsource dans `site/fonts/`, avec `OFL.txt`. `font-display: swap`.
- **Machine à sous.** `computeResults` expose `lowLabel` et `highLabel` (plus petite et plus grande carte chiffrée, « – » sans carte chiffrée), à côté de `medianLabel`. L'interface ne fait qu'afficher ces trois libellés ; le libellé « Médiane » reste sous le rouleau central. Consensus : classe `is-jackpot`, les trois rouleaux s'allument.
- **Histogramme.** Même calcul et même structure ; seule la barre change d'aspect (segments de LED par `repeating-linear-gradient`).
- **Animations.** Halos et clignotements coupés avec `prefers-reduced-motion`, comme aujourd'hui.

## Hors périmètre

Sons, animation de rotation des rouleaux, changement du vocabulaire des boutons (« Révéler », « Nouveau vote » restent).
