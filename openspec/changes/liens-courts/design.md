## Context

Les salles ont un identifiant de 12 caractères `[a-z0-9]` (repris de la roue de la chance), qui sert à la fois de clé dans la base (`rooms/<id>`) et d'adresse (`#/room/<id>`).

## Goals / Non-Goals

**Goals:** un lien qu'on peut dicter et taper ; copier le lien en un clic ; ne casser aucun lien déjà partagé.

**Non-Goals:** choisir soi-même le code de sa salle ; migrer automatiquement les salles existantes.

## Decisions

- **Code = identifiant** : 4 lettres minuscules `a`–`z` (456 976 combinaisons), utilisées directement comme clé `rooms/<code>`. Pas de table de correspondance code → identifiant : rien de plus à garder cohérent. Lettres seulement (pas de chiffres) pour éviter les confusions `o`/`0`, `l`/`1` à l'oral.
- **Unicité** : le navigateur tire un code absent de la liste des salles (corbeille comprise) ; la base refuse déjà de créer une salle qui existe. En cas de refus, nouvel essai avec un autre code (3 essais).
- **Adresse** : `#abcd`, la forme la plus courte. Le routeur accepte aussi `#/abcd` et `#/room/abcd`, en majuscules ou minuscules, et réécrit l'adresse en forme courte (sans recharger ni ajouter d'entrée d'historique). `#/trash` ne peut pas être confondu avec un code (5 lettres).
- **Salles existantes** : les règles et le routeur acceptent encore les identifiants de 12 caractères ; leur lien reste `#/room/<id>`. La migration automatique (déplacer les données d'une salle) est écartée : les salles ne contiennent que des données éphémères, les recréer suffit.
- **Copie** : `navigator.clipboard.writeText`, avec repli sur `document.execCommand('copy')` ; si les deux échouent, le lien est affiché pour une copie manuelle. Le bouton « Partager le lien » du téléphone (partage natif) est conservé.

## Risks / Trade-offs

- [Code devinable] → n'importe qui peut ouvrir une salle en essayant des codes. C'était déjà le cas depuis la liste des salles, publique : pas de changement de niveau de confidentialité.
- [Code formant un mot gênant] → probabilité faible ; la salle peut être recréée.
