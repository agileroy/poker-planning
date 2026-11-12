// Règles de sécurité du projet Firebase du poker planning (poker-planning-vleroy), publiées par ce dépôt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { tryUpdate } from './rules-simulator.mjs';
import {
  createRoomUpdate, renameRoomUpdate, trashRoomUpdate, restoreRoomUpdate, purgeRoomUpdate,
  newRoundUpdate, pseudoKey, roomNameKey,
} from '../site/js/poker-core.js';

const read = async (name) => readFile(new URL(`../${name}`, import.meta.url), 'utf8');
const text = await read('database.rules.json');
const rulesFile = JSON.parse(text);
const rules = rulesFile.rules;

test('fichier JSON formaté sur deux espaces', () => {
  assert.equal(text, `${JSON.stringify(JSON.parse(text), null, 2)}\n`);
});

test('projet dédié : seulement les salles et leurs noms, tout le reste est fermé', () => {
  assert.deepEqual(Object.keys(rules).sort(), ['.read', '.write', 'roomNames', 'rooms']);
  assert.equal(rules['.read'], false);
  assert.equal(rules['.write'], false);
  assert.equal(rules.rooms['.read'], 'auth != null');
});

test('firebase.json publie ce fichier dans le projet du poker planning', async () => {
  assert.deepEqual(JSON.parse(await read('firebase.json')), { database: { rules: 'database.rules.json' } });
  assert.equal(JSON.parse(await read('.firebaserc')).projects.default, 'poker-planning-vleroy');
});

// ---------------------------------------------------------------- Simulation des écritures du site

const NOW = 1_800_000_000_000;
const ROOM = 'produit00001';
const OTHER = 'tech00000002';
const JULIE = 'uid-julie';
const MARC = 'uid-marc';

/** Petite base de test : chaque écriture passe par les règles, comme dans room-store.js. */
function database() {
  let db = null;
  let now = NOW;
  const write = (uid, base, changes) => {
    const result = tryUpdate(rulesFile, db, { uid, now }, base, changes);
    db = result.db;
    return result.ok;
  };
  const room = (id = ROOM) => `rooms/${id}`;
  return {
    get db() { return db; },
    tick(ms) { now += ms; },
    /** update() à la racine (salles et noms). */
    apply: (uid, changes) => write(uid, '', changes),
    /** set() à un chemin. */
    set: (uid, path, value) => write(uid, path, { '': value }),
    createRoom(uid = JULIE, id = ROOM, name = 'Produit') { return write(uid, '', createRoomUpdate(id, name)); },
    /** Arrivée comme room-store.js : réservation du pseudo, fiche, activité, connexion. */
    join(uid, pseudo, id = ROOM) {
      return write(uid, `${room(id)}/pseudos/${pseudoKey(pseudo)}`, { '': uid })
        && write(uid, `${room(id)}/participants/${uid}/pseudo`, { '': pseudo })
        && write(uid, `${room(id)}/participants/${uid}/lastActive`, { '': { '.sv': 'timestamp' } })
        && write(uid, `${room(id)}/participants/${uid}/connections/c1`, { '': true });
    },
    vote: (uid, value, round = 0, id = ROOM, target = uid) =>
      write(uid, `${room(id)}/votes/${target}`, { '': { value, round } }),
    reveal: (uid, round = 0, id = ROOM) => write(uid, `${room(id)}/state`, { '': { round, revealed: true } }),
    newRound: (uid, round = 0, id = ROOM) => write(uid, room(id), newRoundUpdate(round)),
    autoReveal: (uid, value, id = ROOM) => write(uid, `${room(id)}/settings/autoReveal`, { '': value }),
    removeParticipant: (uid, target, id = ROOM) => write(uid, `${room(id)}/participants/${target}`, { '': null }),
    roomData: (id = ROOM) => db?.rooms?.[id] ?? null,
  };
}

test('créer une salle : nom et réservation du nom en une écriture', () => {
  const t = database();
  assert.equal(t.createRoom(), true);
  assert.equal(t.roomData().name, 'Produit');
  assert.equal(t.roomData().createdAt, NOW);
  assert.equal(t.db.roomNames[roomNameKey('Produit')], ROOM);
});

test('nom déjà réservé par une autre salle : création refusée par la base', () => {
  const t = database();
  t.createRoom(JULIE, ROOM, 'Été');
  assert.equal(t.createRoom(MARC, OTHER, 'ete'), false);
  assert.equal(t.roomData(OTHER), null);
});

test('création refusée sans connexion, avec un identifiant invalide ou un champ inconnu', () => {
  const t = database();
  assert.equal(t.createRoom(null), false);
  assert.equal(t.apply(JULIE, { 'rooms/PAS-VALIDE': { name: 'X', createdAt: { '.sv': 'timestamp' } } }), false);
  assert.equal(t.apply(JULIE, { [`rooms/${ROOM}`]: { name: 'X', createdAt: { '.sv': 'timestamp' }, admin: true } }), false);
});

test('pas d\'arrivée ni de vote dans une salle qui n\'existe pas', () => {
  const t = database();
  assert.equal(t.join(JULIE, 'Julie'), false);
  assert.equal(t.vote(JULIE, '5'), false);
  assert.equal(t.roomData(), null);
});

test('arrivée, vote, révélation et nouveau vote dans une salle active', () => {
  const t = database();
  t.createRoom();
  assert.equal(t.join(JULIE, 'Julie'), true);
  assert.equal(t.join(MARC, 'Marc'), true);
  assert.equal(t.vote(JULIE, '5'), true);
  assert.equal(t.vote(MARC, 'scissors'), true);
  assert.equal(t.reveal(MARC), true);
  assert.equal(t.vote(JULIE, '8'), false, 'votes figés après la révélation');
  assert.equal(t.newRound(JULIE, 0), true);
  assert.equal(t.roomData().votes, undefined);
  assert.deepEqual(t.roomData().state, { round: 1, revealed: false });
  assert.equal(t.vote(JULIE, '3', 1), true);
});

test('vote d\'un autre, carte invalide ou tour périmé : refusés', () => {
  const t = database();
  t.createRoom();
  t.join(JULIE, 'Julie');
  assert.equal(t.vote(MARC, '5', 0, ROOM, JULIE), false);
  assert.equal(t.vote(JULIE, '13'), false);
  assert.equal(t.vote(JULIE, '5', 4), false);
});

test('pseudo unique par salle, libre dans une autre salle', () => {
  const t = database();
  t.createRoom();
  t.createRoom(MARC, OTHER, 'Tech');
  assert.equal(t.join(JULIE, 'Julie'), true);
  assert.equal(t.join(MARC, 'julie'), false);
  assert.equal(t.join(MARC, 'Julie', OTHER), true);
});

test('les salles sont indépendantes : révéler l\'une ne touche pas l\'autre', () => {
  const t = database();
  t.createRoom();
  t.createRoom(MARC, OTHER, 'Tech');
  t.join(JULIE, 'Julie');
  t.join(MARC, 'Marc', OTHER);
  t.vote(MARC, '3', 0, OTHER);
  assert.equal(t.reveal(JULIE), true);
  assert.equal(t.roomData(OTHER).state, undefined);
  assert.equal(t.vote(MARC, '5', 0, OTHER), true, 'Marc peut encore changer son vote dans « Tech »');
});

test('retrait d\'un inactif seulement après 20 minutes sans activité', () => {
  const t = database();
  t.createRoom();
  t.join(JULIE, 'Julie');
  t.join(MARC, 'Marc');
  t.tick(19 * 60 * 1000);
  assert.equal(t.removeParticipant(JULIE, MARC), false);
  t.tick(2 * 60 * 1000);
  assert.equal(t.removeParticipant(JULIE, MARC), true);
});

test('renommer : nouveau nom réservé, ancien libéré ; nom d\'une autre salle refusé', () => {
  const t = database();
  t.createRoom();
  t.createRoom(MARC, OTHER, 'Tech');
  const room = { id: ROOM, name: 'Produit' };
  assert.equal(t.apply(JULIE, renameRoomUpdate(room, 'Tech')), false);
  assert.equal(t.apply(JULIE, renameRoomUpdate(room, 'Produit & Design')), true);
  assert.equal(t.roomData().name, 'Produit & Design');
  assert.equal(t.db.roomNames[roomNameKey('Produit')], undefined);
  assert.equal(t.createRoom(MARC, 'produit00003', 'Produit'), true);
});

test('corbeille : la salle se vide, reste fermée, puis se restaure à la même adresse', () => {
  const t = database();
  t.createRoom();
  t.join(JULIE, 'Julie');
  t.join(MARC, 'Marc');
  t.vote(MARC, '5');
  t.autoReveal(JULIE, true);
  assert.equal(t.apply(JULIE, trashRoomUpdate(ROOM)), true);
  const trashed = t.roomData();
  assert.equal(trashed.deletedAt, NOW);
  assert.deepEqual(Object.keys(trashed).sort(), ['createdAt', 'deletedAt', 'name', 'settings']);

  assert.equal(t.join(MARC, 'Marc'), false, 'arrivée refusée');
  assert.equal(t.vote(MARC, '5'), false, 'vote refusé');
  assert.equal(t.autoReveal(MARC, false), false, 'réglage refusé');
  assert.equal(t.apply(MARC, renameRoomUpdate({ id: ROOM, name: 'Produit' }, 'Autre')), false, 'renommage refusé');
  assert.equal(t.removeParticipant(MARC, MARC), true, 'départ toujours possible (onDisconnect)');

  assert.equal(t.apply(MARC, restoreRoomUpdate(ROOM)), true);
  assert.equal(t.roomData().deletedAt, undefined);
  assert.equal(t.roomData().settings.autoReveal, true);
  assert.equal(t.join(MARC, 'Marc'), true);
});

test('vider une salle sans la mettre à la corbeille : refusé', () => {
  const t = database();
  t.createRoom();
  t.join(JULIE, 'Julie');
  t.join(MARC, 'Marc');
  assert.equal(t.set(JULIE, `rooms/${ROOM}/participants`, null), false);
  assert.equal(t.set(JULIE, `rooms/${ROOM}/pseudos`, null), false);
  assert.equal(t.set(JULIE, `rooms/${ROOM}/state`, null), false);
});

test('suppression définitive : seulement depuis la corbeille, et le nom est libéré', () => {
  const t = database();
  t.createRoom();
  const room = { id: ROOM, name: 'Produit' };
  assert.equal(t.apply(JULIE, purgeRoomUpdate(room)), false);
  t.apply(JULIE, trashRoomUpdate(ROOM));
  assert.equal(t.createRoom(MARC, OTHER, 'produit'), false, 'nom réservé par la corbeille');
  assert.equal(t.apply(JULIE, purgeRoomUpdate(room)), true);
  assert.equal(t.roomData(), null);
  assert.equal(t.createRoom(MARC, OTHER, 'produit'), true);
});
