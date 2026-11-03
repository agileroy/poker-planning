// Règles de sécurité du projet Firebase du poker planning (poker-planning-vleroy), publiées par ce dépôt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = async (name) => readFile(new URL(`../${name}`, import.meta.url), 'utf8');
const text = await read('database.rules.json');
const rules = JSON.parse(text).rules;

test('fichier JSON formaté sur deux espaces', () => {
  assert.equal(text, `${JSON.stringify(JSON.parse(text), null, 2)}\n`);
});

test('projet dédié : le fichier ne contient que la branche room, tout le reste est fermé', () => {
  assert.deepEqual(Object.keys(rules).sort(), ['.read', '.write', 'room']);
  assert.equal(rules['.read'], false);
  assert.equal(rules['.write'], false);
});

test('firebase.json publie ce fichier dans le projet du poker planning', async () => {
  assert.deepEqual(JSON.parse(await read('firebase.json')), { database: { rules: 'database.rules.json' } });
  assert.equal(JSON.parse(await read('.firebaserc')).projects.default, 'poker-planning-vleroy');
});
