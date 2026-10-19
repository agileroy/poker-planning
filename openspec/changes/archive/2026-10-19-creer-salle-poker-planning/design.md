## Context

Dépôt neuf. L'auteur a déjà publié `prepare-certification` en site statique vanilla sur GitHub Pages, avec des tests `node --test` qui bloquent la publication : on reprend cette organisation. La différence de fond : ici, plusieurs navigateurs partagent le même état (présents, votes, révélation). L'auteur a choisi Firebase pour cet état partagé. Des participants passent par un VPN d'entreprise.

## Goals / Non-Goals

**Goals:**
- Une salle unique, temps réel, utilisable sans compte depuis un ordinateur ou un téléphone, y compris derrière un VPN.
- Des règles du jeu (vote figé après révélation, un participant ne touche qu'à son vote) appliquées par la base, pas seulement par l'interface.
- Une logique métier pure, testée sans navigateur ni Firebase.

**Non-Goals:**
- Plusieurs salles, titre de story, historique, observateur, révélation automatique, minuteur.
- Empêcher un utilisateur technique de lire les votes cachés dans les données (voir Risques).
- Tests automatiques des règles Firebase (ils demandent l'émulateur Firebase et Java) : vérification manuelle documentée.

## Decisions

- **Structure du site** : `site/index.html`, `site/app.css`, `site/img/` (icône ciseaux SVG dessinée pour le projet, dos de carte en CSS), et dans `site/js/` :
  - `poker-core.js` : logique pure, sans DOM ni Firebase (jeu de cartes, validation et normalisation du pseudo, vue de la salle à partir de l'état brut, calcul des résultats) ;
  - `room-store.js` : seul module qui parle à Firebase (connexion, présence, pseudo, vote, révélation, nouveau vote) ;
  - `app.js` : interface ;
  - `firebase-config.js` : configuration publique du projet Firebase.
  Alternative écartée : un framework avec étape de build, inutile pour cette taille.

- **Realtime Database plutôt que Firestore** : elle gère nativement la présence (`.info/connected` et `onDisconnect`), qui est le cœur de la liste des présents, et passe par WebSocket ou, à défaut, par requêtes HTTPS longues : compatible VPN. Région `europe-west1`.

- **SDK Firebase** : modules ES officiels chargés depuis `https://www.gstatic.com/firebasejs/12.19.0/…`. La 13.0.0, sortie le 7 octobre 2026, est une version majeure trop récente : on reste sur la dernière 12.x et on montera de version dans un changement séparé. Pas de dépendance npm.

- **Identité** : authentification anonyme Firebase. Chaque navigateur reçoit un identifiant stable (`uid`), conservé par le SDK : rechargements et onglets multiples gardent la même identité. Le pseudo est mémorisé dans `localStorage` (lecture et écriture protégées par try/catch).

- **Modèle de données** (sous `/room`) :
  - `state` : `{ round: entier, revealed: booléen }` ;
  - `participants/{uid}` : `{ pseudo, connections: { {connId}: true } }`, une entrée de connexion par onglet, retirée par `onDisconnect`. Un participant est présent tant qu'il a au moins une connexion ; son entrée est supprimée avec la dernière ;
  - `pseudos/{cléNormalisée}` : `uid` du titulaire, pour garantir l'unicité ;
  - `votes/{uid}` : `{ value, round }`.

- **Unicité du pseudo** : réservation par transaction sur `pseudos/{clé}` (clé = pseudo en minuscules, sans espaces de bord, caractères interdits par Firebase `.#$[]/` encodés). La réservation réussit si la clé est libre, déjà à soi, ou détenue par un participant qui n'est plus présent (aucune connexion) ; elle est libérée lors d'un changement de pseudo. Elle n'est pas libérée par `onDisconnect`, car fermer un onglet sur deux libérerait le pseudo d'un participant toujours présent. Les règles interdisent d'écraser la réservation d'un participant présent.

- **Nouveau vote = effacement réel et atomique** : « Nouveau vote » envoie une seule mise à jour multi-chemins qui, en même temps, supprime tout le nœud `votes`, incrémente `state.round` et remet `revealed` à `false`. Firebase applique ces écritures ensemble ou pas du tout : tous les participants voient la salle vide au même instant, et plus aucun vote de l'ancien tour ne reste dans la base. Les règles n'autorisent la suppression de `votes` en entier que dans cette mise à jour précise (le nouveau `state.round` doit valoir l'ancien + 1 et `revealed` repasser à `false`) ; en dehors de ce cas, chacun ne peut toujours écrire que son propre vote. Le numéro de tour reste stocké avec chaque vote : un vote envoyé de l'ancien tour à la dernière milliseconde est refusé par les règles au lieu de réapparaître dans le nouveau tour. Deux clics simultanés sur « Nouveau vote » : le second est refusé par les règles (son numéro de tour est périmé) et l'interface l'ignore, la salle étant déjà remise à zéro. Alternative écartée : laisser les anciens votes en base et les ignorer par numéro de tour ; le résultat affiché était le même, mais les votes n'étaient pas réellement effacés.

- **Votes conservés à la déconnexion, jusqu'au nouveau vote** : `votes/{uid}` n'est pas effacé quand le participant part. Un participant absent n'est ni affiché ni compté (spec « Départ avant la révélation ») ; s'il revient pendant le même tour, son vote réapparaît. C'est ce qui permet de garder son vote au rechargement. Le « Nouveau vote » suivant l'efface avec tous les autres.

- **Révélation et vote figé** : « Révéler » écrit `revealed = true`. Les règles refusent toute écriture dans `votes/{uid}` quand `state.revealed` est vrai, et refusent un `round` différent du tour courant ou une `value` hors du jeu de cartes. Une révélation concurrente de deux participants donne le même résultat.

- **Quitter** : le participant supprime sa propre fiche `participants/{uid}` (tous ses onglets), son vote s'il n'est pas révélé et sa réservation de pseudo, annule ses `onDisconnect`, puis appelle `window.close()`, que le navigateur n'accepte que pour un onglet ouvert par un script ou sans historique ; sinon un écran « quitté » s'affiche.

- **Activité et retrait automatique des inactifs** : chaque action écrit `participants/{uid}/lastActive` avec l'heure du serveur (`serverTimestamp`, imposée par les règles : `newData.val() === now`), de même qu'une interaction (souris, clavier, toucher) sur l'onglet affiché, au plus une fois toutes les 5 minutes. Chaque navigateur présent vérifie chaque minute, avec l'heure du serveur estimée (`.info/serverTimeOffset`), quels participants sont inactifs depuis plus de 20 minutes (constante `INACTIVITY_MS`) et supprime leur fiche ; les règles ne l'autorisent que si le `lastActive` de la fiche date de plus de 20 minutes selon `now`. Plusieurs navigateurs peuvent retirer le même inactif en même temps : la suppression est idempotente. Le retiré, s'il a encore un onglet ouvert, voit sa fiche disparaître : il cesse de rouvrir sa présence et affiche l'écran « retiré pour inactivité ». Son pseudo redevient libre puisqu'il n'est plus présent ; son vote n'est plus compté. Les ordinateurs en veille ou éteints sont déjà retirés de la liste par la détection de déconnexion de Firebase. Alternative écartée : un bouton « Réinitialiser les participants », qui demandait une action humaine.

- **QR code pour rejoindre** : bibliothèque `qrcode-generator` 1.4.4 (licence MIT), embarquée dans `site/vendor/` comme dans `prepare-certification` et chargée par une balise `<script defer>` avant les modules ; le QR code est généré en SVG (modules sombres, fond clair, y compris en thème sombre). Carte compacte (environ 120 px) dans la colonne de droite sur écran large, agrandissement dans une boîte de dialogue `<dialog>` (Échap natif) ; sur écran étroit, bouton « Partager le lien » via `navigator.share`, avec copie dans le presse-papiers en repli.

- **Valeurs de carte** : chaînes `"?"`, `"0"`, `"1"`, `"2"`, `"3"`, `"5"`, `"8"`, `"scissors"`, définies une seule fois dans `poker-core.js` et reprises dans les règles.

- **Format des nombres** : `Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })` pour la moyenne.

- **Tests** : `tests/poker-core.test.mjs` couvre la validation du pseudo, la vue de la salle (présence, votes du tour courant, carte de dos), et tous les scénarios de `vote-results`. Les parcours temps réel sont vérifiés à la main avec deux navigateurs, en suivant une liste de contrôle dans `tasks.md`.

- **Publication** : workflow `.github/workflows/pages.yml` repris de `prepare-certification` (tests puis publication de `site/`).

## Risks / Trade-offs

- [Votes cachés lisibles dans les données par un utilisateur technique avant la révélation] → Assumé pour une équipe de confiance ; l'interface ne les montre jamais. Un vrai secret demanderait un serveur, hors de la solution choisie.
- [Configuration Firebase publique dans le dépôt] → Normal pour Firebase : la protection repose sur les règles de sécurité, l'authentification anonyme et la liste des domaines autorisés (`vinchou59.github.io`, `localhost`).
- [Salle accessible à toute personne qui a l'adresse] → Accepté : lien partagé à l'équipe seulement. Un mot de passe de salle pourra venir plus tard.
- [Détection d'une coupure brutale (ordinateur mis en veille) jusqu'à une minute environ] → Délai propre à Firebase, acceptable.
- [Réseau d'entreprise filtré] → Constaté le 19 octobre 2026 : sous le VPN de l'entreprise, le proxy Zscaler bloque par catégorie le site GitHub Pages (« Services professionnels »), la base Firebase (« Marketing d'entreprise ») et Firebase Hosting (« Hébergement Web ») ; seul `www.gstatic.com` passe. Aucun hébergement grand public ne contournerait proprement ce filtrage. Décision de l'auteur : les participants rejoignent depuis leur téléphone, hors VPN, grâce au QR code affiché dans la salle. Une exception pourra être demandée au service informatique, ou l'outil hébergé sur l'infrastructure de l'entreprise dans un changement séparé.
- [Limites de l'offre gratuite (100 connexions simultanées)] → Largement suffisant pour une équipe.

## Migration Plan

1. L'auteur crée le projet Firebase (guidé pas à pas) : Realtime Database en `europe-west1`, authentification anonyme activée, domaine `vinchou59.github.io` autorisé ; il transmet la configuration web.
2. Implémenter, tester en local (`localhost`) avec deux navigateurs.
3. Publier les règles `database.rules.json` dans la console Firebase.
4. Activer GitHub Pages (source : GitHub Actions), pousser sur `main`, vérifier le site publié, puis un essai depuis le VPN.

## Open Questions

_Aucune._
