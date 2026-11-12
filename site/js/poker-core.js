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

// ---------------------------------------------------------------- Salles
// Mêmes règles de nommage que les équipes de la roue de la chance. Les écritures sont
// des mises à jour multi-chemins relatives à la racine de la base.

export const ROOM_NAME_MAX_LENGTH = 50;

/** Valeur que Firebase remplace par l'heure du serveur (équivalent de serverTimestamp()). */
export const SERVER_TIME = Object.freeze({ '.sv': 'timestamp' });

export const ROOM_MESSAGES = Object.freeze({
  nameRequired: 'Le nom de la salle est obligatoire.',
  tooLong: `${ROOM_NAME_MAX_LENGTH} caractères au maximum.`,
  taken: (name) => `Une salle « ${name} » existe déjà.`,
  takenInTrash: (name) => `Une salle « ${name} » existe déjà dans la corbeille.`,
});

/** Supprime les espaces en début et fin, et réduit les espaces multiples à un seul. */
export function normalizeRoomName(raw) {
  return typeof raw === 'string' ? raw.trim().replace(/\s+/g, ' ') : '';
}

/**
 * Clé d'unicité d'un nom de salle, utilisable comme clé Firebase : insensible à la
 * casse, aux accents et aux espaces en trop (« Été » et « ete » ont la même clé).
 */
export function roomNameKey(raw) {
  return normalizeRoomName(raw)
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('fr-FR')
    .replace(/[.#$[\]/%\u0000-\u001f\u007f]/g, (char) =>
      '%' + char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'));
}

/** Vérifie un nom de salle saisi. Renvoie { ok, name } ou { ok: false, error }. */
export function validateRoomName(raw) {
  const name = normalizeRoomName(raw);
  if (!name) return { ok: false, error: ROOM_MESSAGES.nameRequired };
  if (name.length > ROOM_NAME_MAX_LENGTH) return { ok: false, error: ROOM_MESSAGES.tooLong };
  return { ok: true, name };
}

const ID_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
export const ROOM_ID_PATTERN = /^[a-z0-9]{12}$/;

/** Identifiant de salle de 12 caractères [a-z0-9], comme dans les autres outils. */
export function newRoomId(random = cryptoRandom) {
  let id = '';
  for (let i = 0; i < 12; i++) id += ID_ALPHABET[Math.floor(random() * ID_ALPHABET.length)];
  return id;
}

function cryptoRandom() {
  const buffer = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buffer);
  return buffer[0] / 2 ** 32;
}

const nameCollator = new Intl.Collator('fr', { sensitivity: 'base', numeric: true });

function toRoom(id, raw) {
  return {
    id,
    name: String(raw?.name ?? ''),
    createdAt: typeof raw?.createdAt === 'number' ? raw.createdAt : 0,
    deletedAt: typeof raw?.deletedAt === 'number' ? raw.deletedAt : null,
    presentCount: Object.values(raw?.participants ?? {})
      .filter((p) => isPresent(p) && typeof p.pseudo === 'string').length,
  };
}

/** Une salle d'après son contenu brut, ou null si elle n'existe pas (ou plus). */
export function roomInfo(id, raw) {
  return raw && typeof raw.name === 'string' ? toRoom(id, raw) : null;
}

/** Salles actives (par nom) et salles de la corbeille (plus récentes d'abord), d'après /rooms. */
export function buildRoomsView(rooms) {
  const all = Object.entries(rooms ?? {})
    .filter(([, raw]) => typeof raw?.name === 'string')
    .map(([id, raw]) => toRoom(id, raw));
  return {
    active: all.filter((r) => r.deletedAt === null)
      .sort((a, b) => nameCollator.compare(a.name, b.name) || a.createdAt - b.createdAt || a.id.localeCompare(b.id)),
    trash: all.filter((r) => r.deletedAt !== null).sort((a, b) => b.deletedAt - a.deletedAt),
  };
}

/** Message d'erreur si le nom est déjà pris par une autre salle (corbeille comprise), sinon null. */
export function roomNameConflict(rooms, name, exceptId = null) {
  const key = roomNameKey(name);
  const { active, trash } = buildRoomsView(rooms);
  const taken = [...active, ...trash].find((r) => r.id !== exceptId && roomNameKey(r.name) === key);
  if (!taken) return null;
  return taken.deletedAt === null ? ROOM_MESSAGES.taken(taken.name) : ROOM_MESSAGES.takenInTrash(taken.name);
}

/** « Personne », « 1 présent », « 3 présents ». */
export function presentLabel(count) {
  if (!count) return 'Personne';
  return `${count} ${count > 1 ? 'présents' : 'présent'}`;
}

export function createRoomUpdate(roomId, name) {
  return {
    [`rooms/${roomId}`]: { name, createdAt: SERVER_TIME },
    [`roomNames/${roomNameKey(name)}`]: roomId,
  };
}

export function renameRoomUpdate(room, name) {
  const update = {
    [`rooms/${room.id}/name`]: name,
    [`roomNames/${roomNameKey(name)}`]: room.id,
  };
  if (roomNameKey(room.name) !== roomNameKey(name)) update[`roomNames/${roomNameKey(room.name)}`] = null;
  return update;
}

/** Corbeille : la salle se ferme et se vide (présents, pseudos, votes, tour) ; nom, adresse et réglages restent. */
export function trashRoomUpdate(roomId) {
  const base = `rooms/${roomId}`;
  return {
    [`${base}/deletedAt`]: SERVER_TIME,
    [`${base}/state`]: null,
    [`${base}/votes`]: null,
    [`${base}/participants`]: null,
    [`${base}/pseudos`]: null,
  };
}

export const restoreRoomUpdate = (roomId) => ({ [`rooms/${roomId}/deletedAt`]: null });

/** Suppression définitive : la salle et la réservation de son nom. */
export function purgeRoomUpdate(room) {
  return {
    [`rooms/${room.id}`]: null,
    [`roomNames/${roomNameKey(room.name)}`]: null,
  };
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
 * @param {{state?: object, participants?: object, votes?: object}} raw contenu de /rooms/<id>
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
    results = {
      ...computeResults(voters.map((p) => p.vote)),
      extremes: computeExtremes(voters),
      gap: null,
      questionPseudos: voters.filter((p) => p.vote === '?').map((p) => p.pseudo)
        .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' })),
    };
    results.gap = computeGap(results.extremes);
    for (const p of participants) {
      p.extreme = !results.extremes || p.vote === null ? null
        : p.vote === results.extremes.low.value ? 'low'
          : p.vote === results.extremes.high.value ? 'high' : null;
    }
  }

  return {
    round,
    revealed,
    autoReveal: raw?.settings?.autoReveal === true,
    participants,
    voters: participants.filter((p) => !p.observer),
    observers: participants.filter((p) => p.observer),
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

const listFormatter = new Intl.ListFormat('fr', { style: 'long', type: 'conjunction' });

/** Message qui nomme les participants ayant joué « ? » : { title, text }, ou null s'il n'y en a pas. */
export function questionMessage(pseudos) {
  if (!pseudos.length) return null;
  return pseudos.length === 1
    ? { title: `${pseudos[0]} a joué « ? »`, text: 'Prenez le temps de clarifier la story avec elle ou lui.' }
    : { title: `${listFormatter.format(pseudos)} ont joué « ? »`, text: 'Prenez le temps de clarifier la story avec eux.' };
}

/** Nombre minimal de votants et part de votes à partir desquels les retardataires sont nommés. */
export const WAITING_MIN_VOTERS = 4;
export const WAITING_MIN_RATIO = 0.75;

/** Pseudos des votants présents encore sans vote, quand il est utile de les nommer ; sinon liste vide. */
export function waitingFor(view) {
  if (view.revealed) return [];
  const voters = view.participants.filter((p) => !p.observer);
  const missing = voters.filter((p) => !p.hasVoted);
  const ratio = voters.length ? (voters.length - missing.length) / voters.length : 0;
  if (voters.length < WAITING_MIN_VOTERS || ratio < WAITING_MIN_RATIO || missing.length === 0) return [];
  return missing.map((p) => p.pseudo).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
}

/** « En attente de Paul », « En attente de Léa et Paul ». */
export function waitingMessage(pseudos) {
  return `En attente de ${listFormatter.format(pseudos)}`;
}

/** Révélation automatique possible : cartes cachées et chaque votant présent (hors observateurs) a voté. */
export function allVotersVoted(view) {
  const voters = view.participants.filter((p) => !p.observer);
  return !view.revealed && voters.length > 0 && voters.every((p) => p.hasVoted);
}

/** Durée du décompte avant la révélation automatique, en secondes. */
export const AUTO_REVEAL_SECONDS = 3;

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

/** Échelle des cartes chiffrées, pour compter les crans d'écart. */
export const NUMERIC_SCALE = Object.freeze(CARDS.map((c) => c.value).filter(isNumericCard));
/** Écart à partir duquel les deux camps sont invités à s'expliquer. */
export const GAP_MIN_STEPS = 2;

/** Nombre de crans entre deux cartes chiffrées sur l'échelle 0, 1, 2, 3, 5, 8. */
export function stepsBetween(a, b) {
  return Math.abs(NUMERIC_SCALE.indexOf(b) - NUMERIC_SCALE.indexOf(a));
}

/** Écart important entre le vote le plus bas et le plus haut, ou null. */
export function computeGap(extremes) {
  if (!extremes) return null;
  const steps = stepsBetween(extremes.low.value, extremes.high.value);
  return steps >= GAP_MIN_STEPS ? { steps, low: extremes.low, high: extremes.high } : null;
}

/** Textes de l'encadré d'écart : titre, puis une question par camp. */
export function gapMessage({ low, high }) {
  const names = (side) => listFormatter.format(side.pseudos);
  const pronoun = (side) => (side.pseudos.length > 1 ? 'vous' : 'te');
  return {
    title: `${names(low)} (${low.value}) et ${names(high)} (${high.value}) ne voient pas la story de la même façon`,
    simpler: `${names(low)}, qu'est-ce qui ${pronoun(low)} paraît plus simple ?`,
    harder: `${names(high)}, qu'est-ce qui ${pronoun(high)} paraît plus compliqué ?`,
  };
}

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
