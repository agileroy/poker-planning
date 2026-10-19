## Decisions

- `gapMessage(gap)` renvoie `{ title, simpler, harder }` : deux questions distinctes au lieu d'une phrase unique, affichées dans deux paragraphes (`#gap-simpler`, `#gap-harder`), ce qui garantit le retour à la ligne à toutes les largeurs.
- `gap.steps` reste calculé (critère de déclenchement, tests) mais n'est plus affiché.
