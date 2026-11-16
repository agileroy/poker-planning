// Salles : noms, liste, écritures (mêmes règles que les équipes de la roue de la chance).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateRoomName, normalizeRoomName, roomNameKey, roomNameConflict, buildRoomsView, roomInfo,
  newRoomId, ROOM_ID_PATTERN, roomHash, parseHash, presentLabel, ROOM_MESSAGES, SERVER_TIME,
  createRoomUpdate, renameRoomUpdate, trashRoomUpdate, restoreRoomUpdate, purgeRoomUpdate,
} from '../site/js/poker-core.js';

const here = { c1: true };

test('nom de salle : espaces retirés et réduits, vide refusé, 50 caractères au plus', () => {
  assert.deepEqual(validateRoomName('  Produit   &  Design '), { ok: true, name: 'Produit & Design' });
  assert.deepEqual(validateRoomName('   '), { ok: false, error: 'Le nom de la salle est obligatoire.' });
  assert.equal(validateRoomName('x'.repeat(50)).ok, true);
  assert.deepEqual(validateRoomName('x'.repeat(51)), { ok: false, error: '50 caractères au maximum.' });
  assert.equal(normalizeRoomName(undefined), '');
});

test('clé de nom insensible à la casse, aux accents et aux espaces, sans caractère interdit', () => {
  assert.equal(roomNameKey('Été'), roomNameKey(' ete '));
  assert.equal(roomNameKey('Ayé'), 'aye');
  assert.doesNotMatch(roomNameKey('a.b#c$d[e]f/g'), /[.#$[\]/]/);
  assert.notEqual(roomNameKey('a.b'), roomNameKey('a%2Eb'));
});

test('conflit de nom : salle active, salle de la corbeille, ou la salle elle-même', () => {
  const rooms = {
    a: { name: 'Été', createdAt: 1 },
    b: { name: 'Produit', createdAt: 2, deletedAt: 5 },
  };
  assert.equal(roomNameConflict(rooms, 'ete'), 'Une salle « Été » existe déjà.');
  assert.equal(roomNameConflict(rooms, 'PRODUIT'), 'Une salle « Produit » existe déjà dans la corbeille.');
  assert.equal(roomNameConflict(rooms, 'ÉTÉ', 'a'), null, 'changer seulement la casse est permis');
  assert.equal(roomNameConflict(rooms, 'Tech'), null);
  assert.equal(ROOM_MESSAGES.taken('X'), 'Une salle « X » existe déjà.');
});

test('liste : salles actives par ordre alphabétique avec leurs présents, corbeille la plus récente d\'abord', () => {
  const view = buildRoomsView({
    t: { name: 'tech', createdAt: 1, participants: { u1: { pseudo: 'Julie', connections: here }, u2: { pseudo: 'Marc' } } },
    e: { name: 'Été', createdAt: 2 },
    p: { name: 'Produit', createdAt: 3, participants: { u3: { pseudo: 'Léa', connections: here }, u4: { pseudo: 'Paul', connections: here } } },
    old: { name: 'Ancienne', createdAt: 0, deletedAt: 10 },
    recent: { name: 'Récente', createdAt: 0, deletedAt: 20 },
    orphan: { participants: { u5: { pseudo: 'X', connections: here } } },
  });
  assert.deepEqual(view.active.map((r) => [r.name, r.presentCount]), [['Été', 0], ['Produit', 2], ['tech', 1]]);
  assert.deepEqual(view.trash.map((r) => r.name), ['Récente', 'Ancienne']);
});

test('salle introuvable : absente ou sans nom ; corbeille signalée', () => {
  assert.equal(roomInfo('x', null), null);
  assert.equal(roomInfo('x', { participants: {} }), null);
  assert.equal(roomInfo('x', { name: 'Produit', createdAt: 1, deletedAt: 9 }).deletedAt, 9);
});

test('« Personne », « 1 présent », « 3 présents »', () => {
  assert.equal(presentLabel(0), 'Personne');
  assert.equal(presentLabel(1), '1 présent');
  assert.equal(presentLabel(3), '3 présents');
});

test('code de salle : 4 lettres, hors des codes déjà pris', () => {
  for (let i = 0; i < 50; i++) assert.match(newRoomId(), /^[a-z]{4}$/);
  assert.equal(newRoomId([], () => 0), 'aaaa');
  // Générateur qui propose d'abord « aaaa » (pris), puis « bbbb ».
  let calls = 0;
  const random = () => (calls++ < 4 ? 0 : 1 / 26);
  assert.equal(newRoomId(['aaaa'], random), 'bbbb');
  assert.throws(() => newRoomId(['aaaa'], () => 0), /Aucun code/);
});

test('identifiants acceptés : 4 lettres, ou 12 caractères pour les anciennes salles', () => {
  for (const ok of ['kfqz', 'k3x9q2m7a0bz']) assert.match(ok, ROOM_ID_PATTERN);
  for (const ko of ['kfq', 'kfqzz', 'kf9z', 'KFQZ', 'k3x9q2m7a0b']) assert.doesNotMatch(ko, ROOM_ID_PATTERN);
});

test('lien d\'une salle : #abcd, ou #/room/<id> pour les anciennes', () => {
  assert.equal(roomHash('kfqz'), '#kfqz');
  assert.equal(roomHash('k3x9q2m7a0bz'), '#/room/k3x9q2m7a0bz');
});

test('lecture de l\'adresse : variantes du lien, liste, corbeille, code mal tapé', () => {
  const room = (roomId, canonical) => ({ name: 'room', roomId, canonical });
  assert.deepEqual(parseHash('#kfqz'), room('kfqz', '#kfqz'));
  assert.deepEqual(parseHash('#KFQZ'), room('kfqz', '#kfqz'));
  assert.deepEqual(parseHash('#/kfqz'), room('kfqz', '#kfqz'));
  assert.deepEqual(parseHash('#/room/KfQz'), room('kfqz', '#kfqz'));
  assert.deepEqual(parseHash('#/room/k3x9q2m7a0bz'), room('k3x9q2m7a0bz', '#/room/k3x9q2m7a0bz'));
  assert.deepEqual(parseHash(''), { name: 'rooms' });
  assert.deepEqual(parseHash('#/'), { name: 'rooms' });
  assert.deepEqual(parseHash('#/trash'), { name: 'trash' });
  assert.deepEqual(parseHash('#kfqzz'), { name: 'missing' });
  assert.deepEqual(parseHash('#/room/zz'), { name: 'missing' });
  assert.deepEqual(parseHash('#/un/deux'), { name: 'rooms' });
});

test('écritures : création, renommage, corbeille, restauration, suppression définitive', () => {
  assert.deepEqual(createRoomUpdate('r1', 'Été'), {
    'rooms/r1': { name: 'Été', createdAt: SERVER_TIME },
    'roomNames/ete': 'r1',
  });
  assert.deepEqual(renameRoomUpdate({ id: 'r1', name: 'Été' }, 'ÉTÉ'), {
    'rooms/r1/name': 'ÉTÉ', 'roomNames/ete': 'r1',
  });
  assert.deepEqual(renameRoomUpdate({ id: 'r1', name: 'Été' }, 'Hiver'), {
    'rooms/r1/name': 'Hiver', 'roomNames/hiver': 'r1', 'roomNames/ete': null,
  });
  assert.deepEqual(trashRoomUpdate('r1'), {
    'rooms/r1/deletedAt': SERVER_TIME,
    'rooms/r1/state': null,
    'rooms/r1/votes': null,
    'rooms/r1/participants': null,
    'rooms/r1/pseudos': null,
  });
  assert.deepEqual(restoreRoomUpdate('r1'), { 'rooms/r1/deletedAt': null });
  assert.deepEqual(purgeRoomUpdate({ id: 'r1', name: 'Été' }), { 'rooms/r1': null, 'roomNames/ete': null });
});
