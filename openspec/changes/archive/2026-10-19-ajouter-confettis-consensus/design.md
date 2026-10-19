## Decisions

- **Module** `site/js/confetti.js` : `launchConfetti()` crée un `<canvas>` plein écran (`position: fixed`, `pointer-events: none`, `aria-hidden="true"`), anime environ 150 rectangles (gravité, rotation, dérive) avec `requestAnimationFrame` pendant 2,5 secondes, puis retire le canvas. Couleurs lues dans les variables CSS du thème (`--accent`, `--success-text`, `--warning-text`, `--card-back-b`) pour s'accorder au thème clair ou sombre. Renvoie `false` sans rien faire si `prefers-reduced-motion: reduce`.
- **Déclenchement** : dans `ui.js`, sur la même transition « non révélé → révélé » que la vibration (jamais au premier rendu), si `results.consensus` n'est pas nul. Un seul canvas à la fois.
- Alternative écartée : une bibliothèque de confettis, inutile pour 80 lignes et contraire à l'objectif de ne rien charger de l'extérieur.
