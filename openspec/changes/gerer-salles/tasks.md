## 1. Base

- [x] 1.1 Remplacer la branche `room` de `database.rules.json` par `rooms/$roomId` (salle active exigée pour toute arrivée, vote ou réglage ; corbeille ; suppression définitive) et `roomNames`. Vérification : `tests/rules.test.mjs` simule les écritures du site contre les règles (création, nom pris, vote, vote d'un autre, salle de la corbeille, restauration, suppression définitive).

## 2. Logique et accès aux données

- [x] 2.1 `poker-core.js` : noms de salle (validation, clé insensible à la casse et aux accents, conflit), identifiants, liste des salles avec nombre de présents, écritures (création, renommage, corbeille, restauration, suppression définitive). Vérification : `npm test`.
- [x] 2.2 `room-store.js` : chemins relatifs à la salle ouverte, abonnement à la liste des salles, écriture multi-chemins. Vérification : parcours complet dans un navigateur.

## 3. Interface

- [x] 3.1 Routage `#/`, `#/trash`, `#/room/<id>` ; rechargement à chaque changement de salle, après avoir quitté la salle. Vérification : retour à la liste et Précédent retirent le participant des présents.
- [x] 3.2 Liste des salles, création, corbeille (restauration, suppression définitive), salle introuvable. Vérification : scénarios de `room-management`.
- [x] 3.3 Dans la salle : nom, « Toutes les salles », renommer, mettre à la corbeille ; QR code et partage avec l'adresse de la salle ; nom de salle sur l'écran de pseudo et sur l'écran « quitté » ; fermeture de la salle si elle passe à la corbeille. Vérification : scénarios de `participant-presence`.

## 4. Documentation et publication

- [x] 4.1 Mettre à jour `README.md` et `openspec/config.yaml`.
- [ ] 4.2 Pousser sur `main`. Vérification : job `rules` publié, création d'une salle par équipe. Effacer l'ancienne branche `room` dans la console Firebase (facultatif).
