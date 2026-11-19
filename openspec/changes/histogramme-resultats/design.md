## Decisions

- **Calcul pur** : `computeHistogram(distribution, mean)` dans `poker-core.js`, appelé par `computeResults` (champ `histogram`). Il renvoie les colonnes (`value`, `label`, `count`, `numeric`, `top`), `maxCount` et `meanPosition`, testés avec Node.js. `distribution` reste exposée telle quelle.
- **Position de la moyenne** : interpolation linéaire entre les deux crans qui l'encadrent (0 = première colonne). L'échelle 0, 1, 2, 3, 5, 8 n'étant pas régulière, le repère est indicatif ; la valeur exacte reste affichée à côté (« Moyenne »). Pas de repère pour un seul cran (consensus) ni sans carte chiffrée.
- **Rendu** : grille CSS d'autant de colonnes que l'histogramme (`--columns`), largeur plafonnée à 76 px par colonne. Hauteur des barres proportionnelle à `count / maxCount` (minimum lisible de 28 px), petite animation de croissance désactivée par `prefers-reduced-motion`. Le repère est placé en CSS (`--mean`) derrière les barres.
- **Accessibilité** : liste `<ul>` étiquetée « Répartition », chaque colonne a un libellé « 2 : 4 votes » ; nombres, valeurs et repère sont masqués aux lecteurs d'écran.
- Alternative écartée : afficher toute l'échelle — les colonnes vides hors de la plage des votes n'apportent rien et tassent l'histogramme.
