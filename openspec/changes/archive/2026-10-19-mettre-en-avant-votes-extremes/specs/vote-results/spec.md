## ADDED Requirements

### Requirement: Votes extrêmes
Après la révélation, les résultats SHALL indiquer le vote chiffré le plus bas et le vote chiffré le plus haut, chacun avec les pseudos des participants présents qui l'ont joué, triés par ordre alphabétique. Les cartes `?` et ciseaux MUST être ignorées. Les votes extrêmes MUST NOT être affichés quand il y a moins de deux valeurs chiffrées différentes. Dans la liste des présents, la carte révélée d'un participant qui a joué une valeur extrême SHALL être mise en évidence, avec un libellé accessible (« vote le plus bas » ou « vote le plus haut »).

#### Scenario: Extrêmes affichés
- **GIVEN** des votes révélés : Julie 1, Marc 8, Léa 8, Paul 3
- **WHEN** les résultats s'affichent
- **THEN** ils indiquent « Plus bas : 1 — Julie » et « Plus haut : 8 — Léa, Marc »

#### Scenario: Cartes non chiffrées ignorées
- **GIVEN** des votes révélés : Julie ?, Marc 2, Léa 5, Paul ciseaux
- **WHEN** les résultats s'affichent
- **THEN** ils indiquent « Plus bas : 2 — Marc » et « Plus haut : 5 — Léa »

#### Scenario: Pas d'extrêmes sans écart
- **GIVEN** des votes révélés : Julie 3, Marc 3, Léa ?
- **WHEN** les résultats s'affichent
- **THEN** aucun vote extrême n'est affiché
