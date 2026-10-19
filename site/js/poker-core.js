// Logique métier pure du poker planning : aucune dépendance au DOM ni à Firebase.
// Importée telle quelle par l'interface (navigateur) et par les tests (Node.js).

/** Jeu de cartes, dans l'ordre d'affichage. `value` est la valeur stockée en base. */
export const CARDS = Object.freeze([
  { value: '?', label: '?' },
  { value: '0', label: '0' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '5', label: '5' },
  { value: '8', label: '8' },
  { value: 'scissors', label: '✂', alt: 'Ciseaux : story à découper' },
]);

export const CARD_VALUES = Object.freeze(CARDS.map((card) => card.value));
export const SCISSORS = 'scissors';
export const PSEUDO_MAX_LENGTH = 20;
/** Délai au-delà duquel un participant sans action est inactif (même valeur dans database.rules.json). */
export const INACTIVITY_MS = 20 * 60 * 1000;
/** Fréquence maximale d'enregistrement de l'activité due aux seules interactions avec la page. */
export const HEARTBEAT_MS = 5 * 60 * 1000;
/** Fréquence de la vérification des inactifs par chaque navigateur. */
export const SWEEP_MS = 60 * 1000;

export const MESSAGES = Object.freeze({
  pseudoLength: `Choisissez un pseudo de 1 à ${PSEUDO_MAX_LENGTH} caractères`,
  pseudoTaken: 'Ce pseudo est déjà utilisé, choisissez-en un autre',
  kicked: 'Vous avez été retiré de la salle pour inactivité',
});

export function isValidCard(value) {
  return CARD_VALUES.includes(value);
}

export function isNumericCard(value) {
  return isValidCard(value) && /^\d+$/.test(value);
}

export function cardByValue(value) {
  return CARDS.find((card) => card.value === value) ?? null;
}

// ---------------------------------------------------------------- Pseudo

/** Pseudo tel qu'il sera affiché : espaces de début et de fin retirés. */
export function normalizePseudo(raw) {
  return String(raw ?? '').trim();
}

/** Vérifie un pseudo saisi. Renvoie { ok, pseudo } ou { ok: false, error }. */
export function validatePseudo(raw) {
  const pseudo = normalizePseudo(raw);
  // Longueur en caractères visibles (un emoji compte pour un).
  const length = [...pseudo].length;
  if (length < 1 || length > PSEUDO_MAX_LENGTH) {
    return { ok: false, error: MESSAGES.pseudoLength };
  }
  return { ok: true, pseudo };
}

/**
 * Clé de réservation du pseudo : insensible à la casse et aux espaces de bord.
 * Les caractères interdits dans une clé Firebase (. # $ [ ] /), le « % » et
 * les caractères de contrôle sont encodés en %XX pour éviter toute collision.
 */
export function pseudoKey(raw) {
  return normalizePseudo(raw)
    .toLocaleLowerCase('fr-FR')
    .replace(/[.#$[\]/%\u0000-\u001f\u007f]/g, (char) =>
      '%' + char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'));
}

// ---------------------------------------------------------------- Tours

/** Écritures groupées du « Nouveau vote » : efface tous les votes et passe au tour suivant. */
export function newRoundUpdate(currentRound) {
  return {
    votes: null,
    state: { round: (Number.isInteger(currentRound) ? currentRound : 0) + 1, revealed: false },
  };
}

// ---------------------------------------------------------------- Vue de la salle

function isPresent(participant) {
  const connections = participant?.connections;
  return Boolean(connections) && typeof connections === 'object' && Object.keys(connections).length > 0;
}

/**
 * Construit ce que l'interface affiche à partir de l'état brut de la base.
 * La valeur du vote d'un autre participant n'est exposée qu'après la révélation.
 *
 * @param {{state?: object, participants?: object, votes?: object}} raw contenu de /room
 * @param {string} myUid identifiant du participant courant
 * @param {number} [now] heure actuelle selon le serveur (ms), pour l'inactivité
 */
export function buildRoomView(raw, myUid, now = Date.now()) {
  const state = raw?.state ?? {};
  const round = Number.isInteger(state.round) ? state.round : 0;
  const revealed = state.revealed === true;
  const votes = raw?.votes ?? {};

  const voteOf = (uid) => {
    const vote = votes[uid];
    return vote && vote.round === round && isValidCard(vote.value) ? vote.value : null;
  };

  const participants = Object.entries(raw?.participants ?? {})
    .filter(([, participant]) => isPresent(participant) && typeof participant.pseudo === 'string')
    .map(([uid, participant]) => {
      const isMe = uid === myUid;
      const observer = participant.observer === true;
      const value = observer ? null : voteOf(uid);   // le vote d'un observateur n'est jamais compté
      return {
        uid,
        pseudo: participant.pseudo,
        observer,
        isMe,
        hasVoted: value !== null,
        vote: revealed || isMe ? value : null,
        inactive: !isMe && isInactive(participant, now),
      };
    })
    .sort((a, b) => a.pseudo.localeCompare(b.pseudo, 'fr', { sensitivity: 'base' }) || a.uid.localeCompare(b.uid));

  const voters = participants.filter((p) => p.hasVoted);
  const me = participants.find((p) => p.isMe) ?? null;

  let results = null;
  if (revealed) {
    results = { ...computeResults(voters.map((p) => p.vote)), extremes: computeExtremes(voters) };
    for (const p of participants) {
      p.extreme = !results.extremes || p.vote === null ? null
        : p.vote === results.extremes.low.value ? 'low'
          : p.vote === results.extremes.high.value ? 'high' : null;
    }
  }

  return {
    round,
    revealed,
    participants,
    me,
    myVote: me ? me.vote : voteOf(myUid),
    voteCount: voters.length,
    voterCount: participants.filter((p) => !p.observer).length,
    observerCount: participants.filter((p) => p.observer).length,
    inactive: participants.filter((p) => p.inactive),
    canVote: !revealed && !(me?.observer),
    canReveal: !revealed && voters.length > 0,
    results,
  };
}

/** Libellé du compteur : « 2 / 3 votes », suivi de « · 1 observateur » s'il y en a. */
export function voteCountLabel({ voteCount, voterCount, observerCount }) {
  let label = `${voteCount} / ${voterCount} ${voteCount > 1 ? 'votes' : 'vote'}`;
  if (observerCount > 0) label += ` · ${observerCount} ${observerCount > 1 ? 'observateurs' : 'observateur'}`;
  return label;
}

// ---------------------------------------------------------------- Inactivité

/** Inactif : aucune action depuis plus de INACTIVITY_MS (ou heure inconnue). */
export function isInactive(participant, now) {
  const last = participant?.lastActive;
  return typeof last !== 'number' || now - last > INACTIVITY_MS;
}

// ---------------------------------------------------------------- Résultats

/**
 * Votes chiffrés extrêmes, avec les pseudos de ceux qui les ont joués.
 * `null` s'il y a moins de deux valeurs chiffrées différentes.
 * @param {{pseudo: string, vote: string|null}[]} voters
 */
export function computeExtremes(voters) {
  const numeric = voters.filter((v) => isNumericCard(v.vote));
  const values = [...new Set(numeric.map((v) => Number(v.vote)))].sort((a, b) => a - b);
  if (values.length < 2) return null;
  const pick = (value) => ({
    value: String(value),
    pseudos: numeric.filter((v) => Number(v.vote) === value).map((v) => v.pseudo)
      .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' })),
  });
  return { low: pick(values[0]), high: pick(values.at(-1)) };
}


const meanFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

/** Moyenne affichée : une décimale au plus, virgule française, « – » si absente. */
export function formatMean(mean) {
  return mean === null || mean === undefined || Number.isNaN(mean) ? '–' : meanFormatter.format(mean);
}

/** Résultats d'un tour révélé, à partir de la liste des valeurs votées. */
export function computeResults(values) {
  const valid = values.filter(isValidCard);

  const distribution = CARDS
    .map((card) => ({ value: card.value, label: card.label, count: valid.filter((v) => v === card.value).length }))
    .filter((entry) => entry.count > 0);

  const numbers = valid.filter(isNumericCard).map(Number);
  const mean = numbers.length ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length : null;

  const allSame = valid.length >= 2 && valid.every((v) => v === valid[0]);
  const consensus = allSame && isNumericCard(valid[0]) ? valid[0] : null;

  return {
    voteCount: valid.length,
    distribution,
    mean,
    meanLabel: formatMean(mean),
    consensus,
    scissorsCount: valid.filter((v) => v === SCISSORS).length,
  };
}
