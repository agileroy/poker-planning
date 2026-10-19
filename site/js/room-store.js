// Seul module qui parle à Firebase : connexion anonyme, présence, pseudo et votes.
// Les règles de sécurité (database.rules.json) appliquent les mêmes contraintes côté base.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {
  getDatabase, ref, onValue, push, set, update, remove, onDisconnect, runTransaction, serverTimestamp,
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
  let serverOffset = 0;

  /** Connexion anonyme : l'identifiant est conservé par le navigateur (rechargements, onglets). */
  function start() {
    return new Promise((resolve, reject) => {
      const stop = onAuthStateChanged(auth, (user) => {
        if (user) {
          stop();
          uid = user.uid;
          onValue(ref(db, '.info/serverTimeOffset'), (snap) => { serverOffset = snap.val() ?? 0; });
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

  /** Heure actuelle selon le serveur, pour juger l'inactivité comme les règles de sécurité. */
  function serverNow() {
    return Date.now() + serverOffset;
  }

  /** Note une action du participant (heure du serveur). */
  function touch() {
    return set(ref(db, `${ROOM}/participants/${uid}/lastActive`), serverTimestamp()).catch(() => {});
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
    await touch();
    if (!entered) {
      entered = true;
      if (connected) await openPresence();
    }
  }

  /** Active ou désactive la révélation automatique pour toute la salle. */
  function setAutoReveal(enabled) {
    touch();
    return set(ref(db, `${ROOM}/settings/autoReveal`), enabled).then(() => true, () => false);
  }

  /** Choisit de voter ou d'observer ; un observateur retire son vote du tour en cours. */
  async function setObserver(observer) {
    touch();
    await set(ref(db, `${ROOM}/participants/${uid}/observer`), observer).catch(() => {});
    if (observer) await clearVote();
  }

  /** Change de pseudo : réserve le nouveau, l'affiche, libère l'ancien. */
  async function changePseudo(oldPseudo, newPseudo) {
    if (!(await claimPseudo(newPseudo))) return false;
    await set(ref(db, `${ROOM}/participants/${uid}/pseudo`), newPseudo);
    touch();
    if (oldPseudo && pseudoKey(oldPseudo) !== pseudoKey(newPseudo)) {
      await remove(ref(db, `${ROOM}/pseudos/${pseudoKey(oldPseudo)}`)).catch(() => {});
    }
    return true;
  }

  /** Vote pour le tour courant. Refusé par la base après révélation ou si le tour a changé. */
  function vote(value, round) {
    touch();
    return set(ref(db, `${ROOM}/votes/${uid}`), { value, round }).then(() => true, () => false);
  }

  function clearVote() {
    if (entered) touch();
    return remove(ref(db, `${ROOM}/votes/${uid}`)).then(() => true, () => false);
  }

  function reveal(round) {
    touch();
    return set(ref(db, `${ROOM}/state`), { round, revealed: true }).then(() => true, () => false);
  }

  /** Nouveau vote : efface tous les votes et passe au tour suivant, en une seule écriture atomique. */
  function newRound(round) {
    // Refusé si un autre participant vient de le faire (tour périmé) : la salle est déjà remise à zéro.
    touch();
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

  /** Retire les participants inactifs (refusé par les règles pour un participant actif ; idempotent). */
  async function removeParticipants(uids) {
    const results = await Promise.all(uids.map((other) =>
      remove(ref(db, `${ROOM}/participants/${other}`)).then(() => true, () => false)));
    return results.filter(Boolean).length;
  }

  /** Le participant a été retiré par un autre : ne plus rouvrir sa présence. */
  async function stopPresence() {
    entered = false;
    await Promise.all(myConnections.splice(0).map((connectionRef) => onDisconnect(connectionRef).cancel().catch(() => {})));
  }

  return {
    start, serverNow, removeParticipants, stopPresence, touch, setObserver, setAutoReveal, onRoom, onConnection, claimPseudo, enter, changePseudo, vote, clearVote, reveal, newRound, leave,
    get uid() { return uid; },
  };
}
