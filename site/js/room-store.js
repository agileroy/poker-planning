// Seul module qui parle à Firebase : connexion anonyme, présence, pseudo et votes.
// Les règles de sécurité (database.rules.json) appliquent les mêmes contraintes côté base.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {
  getDatabase, ref, onValue, push, set, update, remove, onDisconnect, runTransaction,
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js';
import { pseudoKey, newRoundUpdate } from './poker-core.js?v=__VERSION__';

const ROOM = 'room';

/** Identifiants des participants présents (au moins une connexion ouverte). */
function presentUids(raw) {
  return new Set(Object.entries(raw?.participants ?? {})
    .filter(([, p]) => p?.connections && Object.keys(p.connections).length > 0)
    .map(([uid]) => uid));
}

export function createRoomStore(firebaseConfig) {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getDatabase(app);

  let uid = null;
  let lastRoom = null;
  let entered = false;
  let connected = false;
  const myConnections = [];

  /** Connexion anonyme : l'identifiant est conservé par le navigateur (rechargements, onglets). */
  function start() {
    return new Promise((resolve, reject) => {
      const stop = onAuthStateChanged(auth, (user) => {
        if (user) {
          stop();
          uid = user.uid;
          resolve(uid);
        }
      }, reject);
      signInAnonymously(auth).catch(reject);
    });
  }

  /** Abonnement à tout l'état de la salle ; `callback(raw)` à chaque changement. */
  function onRoom(callback) {
    return onValue(ref(db, ROOM), (snapshot) => {
      lastRoom = snapshot.val() ?? {};
      callback(lastRoom);
    });
  }

  /** Abonnement à l'état de la connexion temps réel ; ouvre la présence à chaque (re)connexion. */
  function onConnection(callback) {
    return onValue(ref(db, '.info/connected'), (snapshot) => {
      connected = snapshot.val() === true;
      if (connected && entered) openPresence().catch(() => {});
      callback(connected);
    });
  }

  async function openPresence() {
    // Une entrée par onglet ; Firebase la retire si l'onglet se ferme ou perd le réseau.
    const connectionRef = push(ref(db, `${ROOM}/participants/${uid}/connections`));
    myConnections.push(connectionRef);
    await onDisconnect(connectionRef).remove();
    await set(connectionRef, true);
  }

  /** Réserve un pseudo (transaction). Renvoie true si réservé, false s'il est pris. */
  async function claimPseudo(pseudo) {
    const present = presentUids(lastRoom);
    try {
      const result = await runTransaction(ref(db, `${ROOM}/pseudos/${pseudoKey(pseudo)}`), (owner) =>
        owner === null || owner === uid || !present.has(owner) ? uid : undefined);
      return result.committed;
    } catch {
      return false; // refusé par les règles : réservé par un participant présent
    }
  }

  /** Entre dans la salle avec un pseudo déjà réservé, et ouvre la présence. */
  async function enter(pseudo) {
    await set(ref(db, `${ROOM}/participants/${uid}/pseudo`), pseudo);
    if (!entered) {
      entered = true;
      if (connected) await openPresence();
    }
  }

  /** Change de pseudo : réserve le nouveau, l'affiche, libère l'ancien. */
  async function changePseudo(oldPseudo, newPseudo) {
    if (!(await claimPseudo(newPseudo))) return false;
    await set(ref(db, `${ROOM}/participants/${uid}/pseudo`), newPseudo);
    if (oldPseudo && pseudoKey(oldPseudo) !== pseudoKey(newPseudo)) {
      await remove(ref(db, `${ROOM}/pseudos/${pseudoKey(oldPseudo)}`)).catch(() => {});
    }
    return true;
  }

  /** Vote pour le tour courant. Refusé par la base après révélation ou si le tour a changé. */
  function vote(value, round) {
    return set(ref(db, `${ROOM}/votes/${uid}`), { value, round }).then(() => true, () => false);
  }

  function clearVote() {
    return remove(ref(db, `${ROOM}/votes/${uid}`)).then(() => true, () => false);
  }

  function reveal(round) {
    return set(ref(db, `${ROOM}/state`), { round, revealed: true }).then(() => true, () => false);
  }

  /** Nouveau vote : efface tous les votes et passe au tour suivant, en une seule écriture atomique. */
  function newRound(round) {
    // Refusé si un autre participant vient de le faire (tour périmé) : la salle est déjà remise à zéro.
    return update(ref(db, ROOM), newRoundUpdate(round)).then(() => true, () => false);
  }

  /** Quitte la salle : retire la présence (tous les onglets), le vote non révélé et la réservation du pseudo. */
  async function leave(pseudo) {
    entered = false;
    await Promise.all(myConnections.splice(0).map((connectionRef) => onDisconnect(connectionRef).cancel().catch(() => {})));
    await Promise.all([
      remove(ref(db, `${ROOM}/participants/${uid}`)),
      clearVote(), // refusé après révélation : le vote d'un absent n'est de toute façon plus compté
      pseudo ? remove(ref(db, `${ROOM}/pseudos/${pseudoKey(pseudo)}`)).catch(() => {}) : null,
    ]);
  }

  return {
    start, onRoom, onConnection, claimPseudo, enter, changePseudo, vote, clearVote, reveal, newRound, leave,
    get uid() { return uid; },
  };
}
