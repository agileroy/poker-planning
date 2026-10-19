## Decisions

- Fonction pure `waitingFor(view)` dans `poker-core.js` : liste triée des pseudos des votants présents sans vote, ou liste vide si les cartes sont révélées, s'il y a moins de `WAITING_MIN_VOTERS = 4` votants, si la part de votes est sous `WAITING_MIN_RATIO = 0.75`, ou si tout le monde a voté. `waitingMessage(pseudos)` produit « En attente de … » (`Intl.ListFormat` français).
- Affichage : paragraphe `#waiting` (`role="status"`, `aria-live="polite"`) entre la liste et les boutons, aux couleurs orange de l'écart (fond et texte), avec une icône de sablier en SVG en ligne, décorative.
