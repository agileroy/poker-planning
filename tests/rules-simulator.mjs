// Simulateur minimal des règles de Firebase Realtime Database, pour les tests.
// Il évalue les expressions de database.rules.json comme le fait la base :
// - une écriture est permise si une règle `.write` l'accorde sur le chemin écrit ou un parent ;
// - chaque `.validate` doit être vrai sur le nœud écrit, ses parents et ses nouveaux descendants
//   (jamais sur une valeur effacée) ;
// - une mise à jour multi-chemins est atomique : `newData` voit toutes ses écritures.
// Il ne remplace pas l'émulateur officiel, mais couvre les expressions utilisées ici.

const SERVER_TIME_KEY = '.sv';

const clone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));

function getAt(tree, segments) {
  let node = tree;
  for (const segment of segments) {
    if (node === null || typeof node !== 'object' || !(segment in node)) return null;
    node = node[segment];
  }
  return node ?? null;
}

/** Remplace les horodatages serveur et retire les objets vides (comme la base). */
function resolve(value, now) {
  if (value === null || typeof value !== 'object') return value;
  if (value[SERVER_TIME_KEY] === 'timestamp') return now;
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    const r = resolve(v, now);
    if (r !== null && r !== undefined) out[k] = r;
  }
  return Object.keys(out).length ? out : null;
}

function setAt(tree, segments, value) {
  if (segments.length === 0) return value;
  const root = tree && typeof tree === 'object' ? tree : {};
  const [head, ...rest] = segments;
  const next = setAt(root[head] ?? null, rest, value);
  if (next === null || next === undefined) delete root[head];
  else root[head] = next;
  return Object.keys(root).length ? root : null;
}

class Snapshot {
  constructor(tree, segments) { this.tree = tree; this.segments = segments; }
  #value() { return getAt(this.tree, this.segments); }
  child(path) { return new Snapshot(this.tree, [...this.segments, ...String(path).split('/').filter(Boolean)]); }
  parent() { return new Snapshot(this.tree, this.segments.slice(0, -1)); }
  exists() { return this.#value() !== null; }
  val() { return this.#value(); }
  isNumber() { return typeof this.#value() === 'number'; }
  isString() { return typeof this.#value() === 'string'; }
  isBoolean() { return typeof this.#value() === 'boolean'; }
  hasChildren(names) {
    const v = this.#value();
    if (v === null || typeof v !== 'object') return false;
    return names ? names.every((n) => n in v) : Object.keys(v).length > 0;
  }
}

/** Nœud de règles pour un segment, avec la variable `$…` éventuelle. */
function ruleChild(rules, segment) {
  if (!rules) return null;
  if (Object.hasOwn(rules, segment) && !segment.startsWith('.')) return { node: rules[segment], variable: null };
  const wildcard = Object.keys(rules).find((k) => k.startsWith('$'));
  return wildcard ? { node: rules[wildcard], variable: wildcard } : null;
}

const compiled = new Map();
function evaluate(expression, context) {
  if (typeof expression === 'boolean') return expression;
  const names = Object.keys(context);
  const key = `${names.join(',')}|${expression}`;
  if (!compiled.has(key)) compiled.set(key, new Function(...names, `return (${expression});`));
  const descriptor = Object.getOwnPropertyDescriptor(String.prototype, 'matches');
  Object.defineProperty(String.prototype, 'matches', {
    value(regex) { return regex.test(String(this)); }, configurable: true, writable: true,
  });
  try {
    return compiled.get(key)(...names.map((n) => context[n])) === true;
  } catch {
    return false; // une erreur d'évaluation vaut un refus, comme dans la base
  } finally {
    if (descriptor) Object.defineProperty(String.prototype, 'matches', descriptor);
    else delete String.prototype.matches;
  }
}

/**
 * Applique `changes` (chemins → valeurs, relatifs à `base`) si les règles le permettent.
 * Renvoie { ok, db } : `db` est la nouvelle base si ok, l'ancienne sinon.
 */
export function tryUpdate(rulesFile, db, { uid, now }, base, changes) {
  const rules = rulesFile.rules;
  const baseSegments = String(base).split('/').filter(Boolean);
  const entries = Object.entries(changes).map(([path, value]) =>
    [[...baseSegments, ...path.split('/').filter(Boolean)], resolve(clone(value), now)]);

  let next = clone(db) ?? null;
  for (const [segments, value] of entries) next = setAt(next, segments, clone(value));
  const auth = uid ? { uid } : null;

  const contextAt = (segments, vars) => ({
    data: new Snapshot(db, segments),
    newData: new Snapshot(next, segments),
    root: new Snapshot(db, []),
    auth,
    now,
    ...vars,
  });

  for (const [segments, value] of entries) {
    // Lecture des règles le long du chemin : .write accordé par un parent, .validate des parents.
    let node = rules;
    const vars = {};
    let granted = evaluate(node['.write'] ?? false, contextAt([], vars));
    const ancestorsOk = [];
    for (let i = 0; i < segments.length; i++) {
      const step = ruleChild(node, segments[i]);
      if (!step) { node = null; break; }
      node = step.node;
      if (step.variable) vars[step.variable] = segments[i];
      const here = segments.slice(0, i + 1);
      if (!granted && node['.write'] !== undefined) granted = evaluate(node['.write'], contextAt(here, { ...vars }));
      if (i < segments.length - 1 && node['.validate'] !== undefined && getAt(next, here) !== null) {
        ancestorsOk.push(evaluate(node['.validate'], contextAt(here, { ...vars })));
      }
    }
    if (!granted || ancestorsOk.includes(false)) return { ok: false, db };
    if (value !== null && node && !validateTree(node, segments, { ...vars }, contextAt)) return { ok: false, db };
  }
  return { ok: true, db: next };
}

function validateTree(node, segments, vars, contextAt) {
  if (node['.validate'] !== undefined && !evaluate(node['.validate'], contextAt(segments, vars))) return false;
  const value = contextAt(segments, vars).newData.val();
  if (value === null || typeof value !== 'object') return true;
  for (const key of Object.keys(value)) {
    const step = ruleChild(node, key);
    if (!step) continue;
    const childVars = step.variable ? { ...vars, [step.variable]: key } : vars;
    if (!validateTree(step.node, [...segments, key], childVars, contextAt)) return false;
  }
  return true;
}
