## MODIFIED Requirements

### Requirement: Mise en page sur téléphone
Sur un écran de moins de 760 px de large, la salle SHALL afficher dans cet ordre : le jeu de cartes (avec le choix « Je vote / J'observe »), les résultats une fois révélés, la liste des présents avec « Révéler », « Nouveau vote » et « Partager le lien », puis l'encadré « Observateurs » s'il y en a. Sur un écran plus large, la mise en page MUST NOT changer. À la révélation, chaque participant dont le navigateur le permet SHALL ressentir une courte vibration (au plus 200 ms) ; les navigateurs sans vibration (notamment Safari sur iPhone) SHALL fonctionner normalement, sans message d'erreur. Aucune vibration MUST NOT avoir lieu au chargement de la page si les cartes sont déjà révélées.

#### Scenario: Cartes à portée de pouce
- **GIVEN** un téléphone de 390 px de large
- **WHEN** la salle s'affiche
- **THEN** le jeu de cartes apparaît au-dessus de la liste des présents

#### Scenario: Résultats avant la liste
- **GIVEN** un téléphone de 390 px de large et des cartes révélées
- **WHEN** la salle s'affiche
- **THEN** les résultats apparaissent entre le jeu de cartes et la liste des présents

#### Scenario: Observateurs en dernier
- **GIVEN** un téléphone de 390 px de large et une observatrice dans la salle
- **WHEN** la salle s'affiche
- **THEN** l'encadré « Observateurs » apparaît sous la liste des présents

#### Scenario: Vibration à la révélation
- **GIVEN** Marc sur un téléphone qui permet la vibration, cartes non révélées
- **WHEN** Julie clique sur « Révéler »
- **THEN** le téléphone de Marc vibre brièvement

#### Scenario: Pas de vibration à l'arrivée
- **GIVEN** des cartes déjà révélées
- **WHEN** Marc ouvre la salle
- **THEN** son téléphone ne vibre pas
