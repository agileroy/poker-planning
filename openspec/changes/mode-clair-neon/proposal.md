## Why

L'ambiance casino néon (changement `ambiance-casino-neon`) a supprimé le thème clair. Certaines personnes ne veulent pas, ou ne peuvent pas, lire longtemps sur fond sombre : il faut leur rendre un mode clair, sans perdre l'ambiance.

## What Changes

- Retour du **choix du thème clair ou sombre** : thème du système par défaut, bouton de bascule sur tous les écrans, choix mémorisé dans le navigateur, sans clignotement (comportement d'avant `ambiance-casino-neon`).
- **Mode clair « Vegas en plein jour »** : fond crème, mêmes enseignes, chapiteau d'ampoules, machine à sous et colonnes de LED, avec des néons foncés pour le texte (contraste d'au moins 4,5:1) et des halos plus discrets.
- Le mode sombre reste le néon de nuit actuel.

## Capabilities

### Modified Capabilities

- `site-publication` : ambiance néon en thème clair et en thème sombre ; retour de l'exigence « Choix du thème clair ou sombre ».
- `vote-results` : présentation des messages lisible dans les deux thèmes.

## Impact

`site/index.html` (script de thème en tête, bouton), `site/js/theme.js` (rétabli), `site/app.css` (palette claire par défaut, palette néon nuit sous `[data-theme="dark"]`, halos en variables), `README.md`.
