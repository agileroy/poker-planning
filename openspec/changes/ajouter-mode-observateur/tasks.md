## 1. Mode observateur

- [x] 1.1 Vue de la salle : rôle des participants, votes d'observateur ignorés, compteur et son libellé. Vérification : tests unitaires des scénarios « Compteur sans les observateurs » et du vote ignoré.
- [x] 1.2 Règles Firebase (`observer` booléen) et `room-store.js` (choix du rôle, retrait du vote, activité). Vérification : relecture des règles, essai automatisé.
- [x] 1.3 Interface : sélecteur « Je vote / J'observe », message à la place des cartes, mention dans la liste, mémorisation. Vérification : essai automatisé à trois navigateurs (scénarios de la spec), captures.
- [ ] 1.4 Guider l'auteur pour republier les règles Firebase. Vérification : passage en observateur visible des autres sur le site publié.
