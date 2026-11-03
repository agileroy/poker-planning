// Règles de sécurité de la base partagée : ce dépôt les publie dans le projet poker-planning-vleroy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = async (name) => readFile(new URL(`../${name}`, import.meta.url), 'utf8');
const text = await read('database.rules.json');
const rules = JSON.parse(text).rules;

test('fichier JSON formaté comme dans les dépôts frères', () => {
  assert.equal(text, `${JSON.stringify(JSON.parse(text), null, 2)}\n`);
});

test('la branche room du poker planning existe, la racine est fermée', () => {
  assert.ok(rules.room);
  assert.equal(rules['.read'], false);
  assert.equal(rules['.write'], false);
});

test('firebase.json publie ce fichier dans le projet partagé', async () => {
  assert.deepEqual(JSON.parse(await read('firebase.json')), { database: { rules: 'database.rules.json' } });
  assert.equal(JSON.parse(await read('.firebaserc')).projects.default, 'poker-planning-vleroy');
});
