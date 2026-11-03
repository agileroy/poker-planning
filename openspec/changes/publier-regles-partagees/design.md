## Context

Le projet `poker-planning-vleroy` sert encore à plusieurs outils. Les outils déplacés (Fournée en premier) publient leurs propres règles par GitHub Actions avec un compte de service ; ce changement applique la même mécanique au fichier commun.

## Goals / Non-Goals

**Goals:**
- Plus aucune publication manuelle des règles du projet partagé.
- Une seule source qui publie, pour éviter que deux dépôts publient des versions différentes.

**Non-Goals:**
- Supprimer la copie du fichier dans les autres dépôts (elle reste, identique, tant qu'ils utilisent la base).

## Decisions

- **Publier depuis `poker-planning` seulement** : un seul secret à gérer, et pas de course entre plusieurs dépôts qui publieraient le même fichier. Alternative écartée : un job dans chaque dépôt qui partage la base (un secret par dépôt, et une copie périmée publiée par erreur écraserait les règles des autres).
- **Même job que Fournée** (`npx firebase-tools@15 deploy --only database`, clé écrite dans un fichier temporaire, `GOOGLE_APPLICATION_CREDENTIALS`), site publié après les règles, job sauté sans secret.
- **Test** : `firebase.json` déploie bien `database.rules.json` ; le fichier contient la branche `room` du poker planning et garde la racine fermée, sans figer la liste des autres branches (elle diminue à chaque outil déplacé).

## Risks / Trade-offs

- [Fichier modifié dans un autre dépôt sans passer par `poker-planning`] → il ne serait pas publié ; le README de chaque dépôt partagé renvoie déjà à la règle « fichier identique », et toute recopie part de `poker-planning`.
- [Clé du compte de service] → uniquement en secret GitHub, jamais dans le dépôt ni le chat.

## Migration Plan

Créer le secret, pousser : le job publie le fichier commun actuel (sans `incrementGame`), ce qui termine aussi le nettoyage lié au déplacement de Fournée.

## Open Questions

_Aucune._
