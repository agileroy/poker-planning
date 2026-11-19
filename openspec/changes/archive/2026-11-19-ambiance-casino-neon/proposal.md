## Why

La salle est sobre et efficace, mais un peu austère pour un rituel d'équipe qui doit rester un jeu. Une ambiance « casino de Las Vegas » rend la séance plus vivante, sans rien changer au déroulement du vote. Parmi les trois pistes maquettées (tapis vert, néon Vegas, Monte-Carlo Art déco), l'équipe a retenu le néon Vegas.

## What Changes

- **Ambiance néon unique** : fond nuit, enseignes néon (titres en police Monoton, texte en Chakra Petch), boutons et cartes lumineux. **BREAKING** : le thème clair et le bouton de bascule clair/sombre disparaissent ; le néon n'a de sens que sur fond sombre.
- Polices **embarquées dans le site** (licence SIL OFL), sans appel à Google Fonts ni à aucun service tiers.
- Liste des présents encadrée d'**ampoules de chapiteau** ; votes révélés affichés en pastilles néon.
- Résultats en **machine à sous** : trois rouleaux « Plus bas », « Médiane », « Plus haut ». La médiane reste calculée et affichée comme aujourd'hui.
- Histogramme en **colonnes de LED**.
- Consensus : « **Jackpot !** Consensus : 3 », tous les rouleaux allumés, confettis aux couleurs néon.
- Rien ne change dans la logique du vote, la base ni les règles de sécurité.

## Capabilities

### Modified Capabilities

- `site-publication` : interface en thème sombre unique ; suppression du choix du thème ; polices embarquées.
- `vote-results` : machine à sous (plus bas, médiane, plus haut), libellé du consensus, couleurs des messages sur fond sombre.

## Impact

`site/index.html`, `site/app.css`, `site/js/room-ui.js`, `site/js/poker-core.js` (`computeResults` : plus bas et plus haut), `site/js/confetti.js`, suppression de `site/js/theme.js`, nouveau dossier `site/fonts/`, `tests/poker-core.test.mjs`, `README.md`.
