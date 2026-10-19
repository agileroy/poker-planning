## Why

Les messages qui demandent une discussion après la révélation (écart important, carte « ? », carte ciseaux) se fondent dans le panneau des résultats : l'encadré d'écart est vert comme le consensus, l'alerte ciseaux est d'un jaune-orangé proche. Ils doivent attirer l'œil, et chacun se reconnaître d'un coup d'œil.

## What Changes

- Les trois messages adoptent un même style (option B choisie par l'auteur) : encadré teinté et bordé, pastille ronde pleine avec une icône blanche, titre en gras puis texte.
- Couleurs : écart important en **orange** (icône bulles de discussion), carte « ? » en **rouge** (icône point d'interrogation), carte ciseaux en **violet** (icône ciseaux). Le consensus reste vert.
- Le message de la carte « ? » se lit en deux temps : titre « Julie a joué « ? » », puis « Prenez le temps de clarifier la story avec elle ou lui. ».

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `vote-results` : nouvelle exigence « Présentation des messages à discuter » ; « Questions (carte ?) » modifiée (titre et texte séparés).

## Impact

- `site/app.css` (couleurs orange, rouge, violet en thème clair et sombre ; style commun), `site/index.html`, `site/js/ui.js` (icônes SVG en ligne), `site/js/poker-core.js` (`questionMessage` renvoie titre et texte), tests.
