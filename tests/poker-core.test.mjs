import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CARDS, MESSAGES, validatePseudo, pseudoKey, isNumericCard,
  buildRoomView, computeResults, formatMean, newRoundUpdate,
  INACTIVITY_MS, HEARTBEAT_MS, SWEEP_MS, isInactive, computeExtremes, voteCountLabel, allVotersVoted, AUTO_REVEAL_SECONDS, questionMessage,
} from '../site/js/poker-core.js';

const here = { c1: true };
const room = (overrides = {}) => ({
  state: { round: 3, revealed: false },
  participants: {
    uJulie: { pseudo: 'Julie', connections: here },
    uMarc: { pseudo: 'Marc', connections: here },
  },
  votes: {},
  ...overrides,
});

// ---------------------------------------------------------------- Cartes

test('jeu de cartes dans l\'ordre ?, 0, 1, 2, 3, 5, 8, ciseaux', () => {
  assert.deepEqual(CARDS.map((c) => c.value), ['?', '0', '1', '2', '3', '5', '8', 'scissors']);
  assert.equal(CARDS.at(-1).alt, 'Ciseaux : story à découper');
  assert.ok(isNumericCard('0') && isNumericCard('8'));
  assert.ok(!isNumericCard('?') && !isNumericCard('scissors') && !isNumericCard('13'));
});

// ---------------------------------------------------------------- Pseudo

test('pseudo vide ou uniquement des espaces refusé', () => {
  assert.deepEqual(validatePseudo('   '), { ok: false, error: MESSAGES.pseudoLength });
  assert.deepEqual(validatePseudo(''), { ok: false, error: MESSAGES.pseudoLength });
  assert.equal(MESSAGES.pseudoLength, 'Choisissez un pseudo de 1 à 20 caractères');
});

test('pseudo de 20 caractères accepté, 21 refusé, espaces de bord retirés', () => {
  assert.deepEqual(validatePseudo('  ' + 'a'.repeat(20) + ' '), { ok: true, pseudo: 'a'.repeat(20) });
  assert.equal(validatePseudo('a'.repeat(21)).ok, false);
  assert.deepEqual(validatePseudo('  Julie '), { ok: true, pseudo: 'Julie' });
});

test('un emoji compte pour un caractère', () => {
  assert.equal(validatePseudo('🦊'.repeat(20)).ok, true);
});

test('« Julie » et « julie » ont la même clé de réservation', () => {
  assert.equal(pseudoKey('Julie'), pseudoKey(' julie  '));
  assert.notEqual(pseudoKey('Julie'), pseudoKey('Juliette'));
});

test('clé de pseudo sans caractère interdit par Firebase, sans collision', () => {
  const key = pseudoKey('a.b#c$d[e]f/g');
  assert.doesNotMatch(key, /[.#$[\]/]/);
  assert.notEqual(pseudoKey('a.b'), pseudoKey('a%2Eb'));
});

// ---------------------------------------------------------------- Nouveau vote

test('nouveau vote : efface tous les votes et passe au tour suivant, cartes cachées', () => {
  assert.deepEqual(newRoundUpdate(3), { votes: null, state: { round: 4, revealed: false } });
  assert.deepEqual(newRoundUpdate(undefined), { votes: null, state: { round: 1, revealed: false } });
});

// ---------------------------------------------------------------- Vue de la salle

test('liste des présents triée, avec « vous » signalé', () => {
  const view = buildRoomView(room({
    participants: {
      uMarc: { pseudo: 'Marc', connections: here },
      uLea: { pseudo: 'léa', connections: here },
      uJulie: { pseudo: 'Julie', connections: here },
    },
  }), 'uMarc');
  assert.deepEqual(view.participants.map((p) => p.pseudo), ['Julie', 'léa', 'Marc']);
  assert.deepEqual(view.participants.map((p) => p.isMe), [false, false, true]);
});

test('un participant sans connexion n\'est pas présent', () => {
  const view = buildRoomView(room({
    participants: { uJulie: { pseudo: 'Julie', connections: here }, uLea: { pseudo: 'Léa' } },
  }), 'uJulie');
  assert.deepEqual(view.participants.map((p) => p.pseudo), ['Julie']);
});

test('vote caché : les autres voient seulement qu\'il a voté', () => {
  const raw = room({ votes: { uMarc: { value: '5', round: 3 } } });
  const julie = buildRoomView(raw, 'uJulie');
  const marcSeenByJulie = julie.participants.find((p) => p.uid === 'uMarc');
  assert.equal(marcSeenByJulie.hasVoted, true);
  assert.equal(marcSeenByJulie.vote, null);
  assert.equal(JSON.stringify(julie).includes('"5"'), false, 'aucune valeur exposée avant révélation');
  assert.equal(julie.results, null);

  const marc = buildRoomView(raw, 'uMarc');
  assert.equal(marc.myVote, '5');
});

test('participant sans vote : pas de carte', () => {
  const view = buildRoomView(room(), 'uJulie');
  assert.ok(view.participants.every((p) => !p.hasVoted));
  assert.equal(view.canReveal, false, 'Révéler désactivé sans vote');
});

test('un vote d\'un ancien tour ou d\'une valeur invalide est ignoré', () => {
  const view = buildRoomView(room({
    votes: { uMarc: { value: '5', round: 2 }, uJulie: { value: '13', round: 3 } },
  }), 'uMarc');
  assert.equal(view.voteCount, 0);
  assert.equal(view.myVote, null);
});

test('révélation : valeurs visibles de tous, votes figés', () => {
  const view = buildRoomView(room({
    state: { round: 3, revealed: true },
    votes: { uJulie: { value: '3', round: 3 }, uMarc: { value: '5', round: 3 } },
  }), 'uJulie');
  assert.deepEqual(view.participants.map((p) => p.vote), ['3', '5']);
  assert.equal(view.canVote, false);
  assert.equal(view.canReveal, false);
  assert.ok(view.results);
});

test('départ avant la révélation : seul le vote des présents compte', () => {
  const view = buildRoomView({
    state: { round: 1, revealed: true },
    participants: { uJulie: { pseudo: 'Julie', connections: here }, uLea: { pseudo: 'Léa', connections: {} } },
    votes: { uJulie: { value: '3', round: 1 }, uLea: { value: '8', round: 1 } },
  }, 'uJulie');
  assert.deepEqual(view.participants.map((p) => p.pseudo), ['Julie']);
  assert.equal(view.results.voteCount, 1);
  assert.deepEqual(view.results.distribution.map((d) => d.value), ['3']);
});

test('rechargement : le participant retrouve son vote du tour en cours', () => {
  const view = buildRoomView(room({ votes: { uMarc: { value: '5', round: 3 } } }), 'uMarc');
  assert.equal(view.myVote, '5');
  assert.equal(view.me.hasVoted, true);
});

test('après un nouveau vote, plus aucun vote', () => {
  const before = room({ state: { round: 3, revealed: true }, votes: { uJulie: { value: '3', round: 3 } } });
  const after = { ...before, ...newRoundUpdate(3) };
  const view = buildRoomView(after, 'uJulie');
  assert.equal(view.voteCount, 0);
  assert.equal(view.revealed, false);
  assert.equal(view.canVote, true);
});

// ---------------------------------------------------------------- Résultats

test('répartition dans l\'ordre du jeu, cartes non jouées absentes', () => {
  const r = computeResults(['5', '8', '5', '5']);
  assert.deepEqual(r.distribution.map(({ value, count }) => ({ value, count })), [
    { value: '5', count: 3 }, { value: '8', count: 1 },
  ]);
});

test('moyenne sans ? ni ciseaux : 3, 5, ?, ciseaux → « 4 »', () => {
  assert.equal(computeResults(['3', '5', '?', 'scissors']).meanLabel, '4');
});

test('moyenne arrondie : 3, 5, 8 → « 5,3 »', () => {
  assert.equal(computeResults(['3', '5', '8']).meanLabel, '5,3');
});

test('moyenne décimale : 1, 2 → « 1,5 »', () => {
  assert.equal(computeResults(['1', '2']).meanLabel, '1,5');
});

test('aucune carte chiffrée : ?, ciseaux → « – »', () => {
  assert.equal(computeResults(['?', 'scissors']).meanLabel, '–');
  assert.equal(formatMean(null), '–');
});

test('consensus : 3, 3, 3 → 3 ; 3, 3, 5 → aucun', () => {
  assert.equal(computeResults(['3', '3', '3']).consensus, '3');
  assert.equal(computeResults(['3', '3', '5']).consensus, null);
});

test('pas de consensus pour un seul votant, ni sur ? ou ciseaux', () => {
  assert.equal(computeResults(['5']).consensus, null);
  assert.equal(computeResults(['?', '?']).consensus, null);
  assert.equal(computeResults(['scissors', 'scissors']).consensus, null);
});

test('alerte ciseaux : nombre de cartes ciseaux jouées', () => {
  assert.equal(computeResults(['5', '8', 'scissors']).scissorsCount, 1);
  assert.equal(computeResults(['5', '8']).scissorsCount, 0);
});

// ---------------------------------------------------------------- Inactivité

const NOW = 1_800_000_000_000;
const MIN = 60 * 1000;

test('inactif au-delà de 20 minutes sans action, actif en deçà', () => {
  assert.equal(INACTIVITY_MS, 20 * MIN);
  assert.equal(isInactive({ lastActive: NOW - 25 * MIN }, NOW), true);
  assert.equal(isInactive({ lastActive: NOW - 19 * MIN }, NOW), false);
  assert.equal(isInactive({ lastActive: NOW - 20 * MIN }, NOW), false, 'exactement 20 minutes : encore actif');
  assert.equal(isInactive({}, NOW), true, 'heure inconnue : inactif');
});

test('mention « inactif » dans la vue, jamais pour soi-même', () => {
  const view = buildRoomView({
    state: { round: 0, revealed: false },
    participants: {
      uJulie: { pseudo: 'Julie', connections: here, lastActive: NOW - 2 * 60 * MIN },
      uMarc: { pseudo: 'Marc', connections: here, lastActive: NOW - MIN },
      uPaul: { pseudo: 'Paul', connections: here, lastActive: NOW - 120 * MIN },
    },
  }, 'uJulie', NOW);
  assert.deepEqual(view.participants.map((p) => [p.pseudo, p.inactive]), [['Julie', false], ['Marc', false], ['Paul', true]]);
  assert.deepEqual(view.inactive.map((p) => p.pseudo), ['Paul']);
});

test('activité par interaction au plus toutes les 5 minutes, vérification chaque minute', () => {
  assert.equal(HEARTBEAT_MS, 5 * MIN);
  assert.equal(SWEEP_MS, MIN);
  assert.ok(HEARTBEAT_MS + SWEEP_MS < INACTIVITY_MS, 'un participant qui interagit ne peut pas devenir inactif');
});

// ---------------------------------------------------------------- Votes extrêmes

test('extrêmes : plus bas 1 — Julie, plus haut 8 — Léa, Marc', () => {
  const e = computeExtremes([
    { pseudo: 'Julie', vote: '1' }, { pseudo: 'Marc', vote: '8' }, { pseudo: 'Léa', vote: '8' }, { pseudo: 'Paul', vote: '3' },
  ]);
  assert.deepEqual(e, { low: { value: '1', pseudos: ['Julie'] }, high: { value: '8', pseudos: ['Léa', 'Marc'] } });
});

test('extrêmes : ? et ciseaux ignorés', () => {
  const e = computeExtremes([
    { pseudo: 'Julie', vote: '?' }, { pseudo: 'Marc', vote: '2' }, { pseudo: 'Léa', vote: '5' }, { pseudo: 'Paul', vote: 'scissors' },
  ]);
  assert.deepEqual(e, { low: { value: '2', pseudos: ['Marc'] }, high: { value: '5', pseudos: ['Léa'] } });
});

test('pas d\'extrêmes sans au moins deux valeurs chiffrées différentes', () => {
  assert.equal(computeExtremes([{ pseudo: 'Julie', vote: '3' }, { pseudo: 'Marc', vote: '3' }, { pseudo: 'Léa', vote: '?' }]), null);
  assert.equal(computeExtremes([{ pseudo: 'Julie', vote: '0' }]), null);
  assert.equal(computeExtremes([]), null);
});

test('vue révélée : extrêmes dans les résultats et marque sur les participants', () => {
  const view = buildRoomView({
    state: { round: 1, revealed: true },
    participants: { a: { pseudo: 'Julie', connections: here }, b: { pseudo: 'Marc', connections: here }, c: { pseudo: 'Paul', connections: here } },
    votes: { a: { value: '1', round: 1 }, b: { value: '8', round: 1 }, c: { value: '3', round: 1 } },
  }, 'a');
  assert.deepEqual(view.participants.map((p) => [p.pseudo, p.extreme]), [['Julie', 'low'], ['Marc', 'high'], ['Paul', null]]);
  assert.equal(view.results.extremes.high.value, '8');
});

test('vue non révélée : aucun extrême exposé', () => {
  const view = buildRoomView({
    state: { round: 1, revealed: false },
    participants: { a: { pseudo: 'Julie', connections: here } },
    votes: { a: { value: '1', round: 1 } },
  }, 'a');
  assert.equal(view.results, null);
  assert.equal(view.participants[0].extreme, undefined);
});

// ---------------------------------------------------------------- Mode observateur

const withObserver = (overrides = {}) => ({
  state: { round: 1, revealed: false },
  participants: {
    uJulie: { pseudo: 'Julie', connections: here },
    uMarc: { pseudo: 'Marc', connections: here },
    uLea: { pseudo: 'Léa', connections: here, observer: true },
  },
  votes: { uJulie: { value: '3', round: 1 }, uLea: { value: '5', round: 1 } },
  ...overrides,
});

test('compteur sans les observateurs : « 1 / 2 vote · 1 observateur »', () => {
  const view = buildRoomView(withObserver(), 'uJulie');
  assert.equal(view.voterCount, 2);
  assert.equal(view.observerCount, 1);
  assert.equal(voteCountLabel(view), '1 / 2 vote · 1 observateur');
  assert.equal(voteCountLabel({ voteCount: 2, voterCount: 3, observerCount: 0 }), '2 / 3 votes');
  assert.equal(voteCountLabel({ voteCount: 0, voterCount: 1, observerCount: 2 }), '0 / 1 vote · 2 observateurs');
});

test('vote d\'un observateur ignoré, même révélé', () => {
  const view = buildRoomView(withObserver({ state: { round: 1, revealed: true } }), 'uJulie');
  const lea = view.participants.find((p) => p.pseudo === 'Léa');
  assert.equal(lea.observer, true);
  assert.equal(lea.hasVoted, false);
  assert.equal(lea.vote, null);
  assert.equal(view.results.voteCount, 1);
});

test('un observateur ne peut pas voter mais peut révéler', () => {
  const view = buildRoomView(withObserver(), 'uLea');
  assert.equal(view.canVote, false);
  assert.equal(view.canReveal, true);
});

// ---------------------------------------------------------------- Révélation automatique

test('révélation automatique : tous les votants présents ont voté', () => {
  const raw = (votes, extra = {}) => ({
    state: { round: 1, revealed: false },
    participants: {
      a: { pseudo: 'Julie', connections: here },
      b: { pseudo: 'Marc', connections: here },
      c: { pseudo: 'Léa', connections: here, observer: true },
    },
    votes, ...extra,
  });
  assert.equal(AUTO_REVEAL_SECONDS, 3);
  assert.equal(allVotersVoted(buildRoomView(raw({ a: { value: '3', round: 1 }, b: { value: '5', round: 1 } }), 'a')), true, 'observatrice non attendue');
  assert.equal(allVotersVoted(buildRoomView(raw({ a: { value: '3', round: 1 } }), 'a')), false, 'Marc manque');
  assert.equal(allVotersVoted(buildRoomView(raw({ a: { value: '3', round: 1 }, b: { value: '5', round: 0 } }), 'a')), false, 'vote d\'un ancien tour');
  assert.equal(allVotersVoted(buildRoomView(raw({ a: { value: '3', round: 1 }, b: { value: '5', round: 1 } }, { state: { round: 1, revealed: true } }), 'a')), false, 'déjà révélé');
  assert.equal(allVotersVoted(buildRoomView({ state: { round: 0, revealed: false }, participants: {} }, 'a')), false, 'salle vide');
});

test('option de révélation automatique lue dans settings', () => {
  assert.equal(buildRoomView({ settings: { autoReveal: true } }, 'a').autoReveal, true);
  assert.equal(buildRoomView({}, 'a').autoReveal, false);
});

// ---------------------------------------------------------------- Questions (carte ?)

const revealedWith = (votes) => buildRoomView({
  state: { round: 1, revealed: true },
  participants: Object.fromEntries(Object.keys(votes).map((name) => [name, { pseudo: name, connections: here }])),
  votes: Object.fromEntries(Object.entries(votes).map(([name, value]) => [name, { value, round: 1 }])),
}, 'Marc');

test('une question : « Julie a joué « ? » … avec elle ou lui. »', () => {
  const view = revealedWith({ Julie: '?', Marc: '3', Paul: '5' });
  assert.deepEqual(view.results.questionPseudos, ['Julie']);
  assert.equal(questionMessage(view.results.questionPseudos), 'Julie a joué « ? » : prenez le temps de clarifier la story avec elle ou lui.');
});

test('plusieurs questions, triées : « Julie et Paul ont joué « ? » … avec eux. »', () => {
  const view = revealedWith({ Paul: '?', Julie: '?', Marc: '3' });
  assert.equal(questionMessage(view.results.questionPseudos), 'Julie et Paul ont joué « ? » : prenez le temps de clarifier la story avec eux.');
});

test('aucune question : pas de message', () => {
  const view = revealedWith({ Julie: '3', Marc: '5' });
  assert.deepEqual(view.results.questionPseudos, []);
  assert.equal(questionMessage([]), '');
});
