## Why

Sur ordinateur, les résultats occupent la moitié droite de l'écran, sous la carte « Rejoindre » : avec les messages à discuter (écart, question, ciseaux), le panneau devient très haut alors que l'espace sous la liste des présents reste vide.

## What Changes

- Sur écran large, les résultats passent sous la ligne « Présents / Rejoindre » et occupent toute la largeur.
- À l'intérieur, deux colonnes : à gauche les chiffres (moyenne, répartition, plus bas / plus haut), à droite les messages (écart, consensus, question, ciseaux). Sans message, les chiffres prennent toute la largeur.
- Sur téléphone, rien ne change (cartes, résultats, présents).

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `site-publication` : nouvelle exigence « Disposition des résultats sur grand écran ».

## Impact

- `site/index.html` (les résultats sortent de la colonne de droite), `site/app.css`, tests d'interface.
