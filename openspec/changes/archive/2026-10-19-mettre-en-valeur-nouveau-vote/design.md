## Decisions

- Classe d'état sur la salle (`.room.is-revealed`) posée au rendu : le CSS échange les styles de « Révéler » et « Nouveau vote » (`.button-primary` / `.button-ghost` appliqués par le script selon l'étape), sans dupliquer la logique.
- Halo : classe `is-highlighted` ajoutée sur la même transition « non révélé → révélé » que la vibration et les confettis (jamais au premier rendu), retirée après 4 secondes ; animation douce du `box-shadow`, désactivée par `prefers-reduced-motion` (halo fixe).
- Grand bouton dans un bloc `#relaunch` sous l'en-tête « Votre carte » ; le jeu de cartes, le message d'observateur et l'aide sont masqués pendant la révélation. Le sélecteur « Je vote / J'observe » reste disponible.
- Icône de relance en SVG en ligne, `aria-hidden="true"`.
