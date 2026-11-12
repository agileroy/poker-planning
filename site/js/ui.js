// Routage : liste des salles (#/), corbeille (#/trash) ou salle (#/room/<id>).
// Une page n'ouvre qu'une salle : entrer dans une salle, en sortir ou en changer
// recharge la page, après avoir quitté la salle. Ainsi la présence, les abonnements
// et les minuteurs d'une salle ne peuvent pas déborder sur une autre.

import { ROOM_ID_PATTERN } from './poker-core.js?v=__VERSION__';
import { $, showScreen, showFatal, showFlash, closeDialogsOnBackdrop } from './widgets.js?v=__VERSION__';
import { startLobby } from './lobby.js?v=__VERSION__';
import { startRoom } from './room-ui.js?v=__VERSION__';

export { showFatal };

export function route() {
  const hash = location.hash || '#/';
  const room = hash.match(/^#\/room\/([^/]+)$/);
  if (room && ROOM_ID_PATTERN.test(room[1])) return { name: 'room', roomId: room[1] };
  if (room) return { name: 'missing' };
  if (hash === '#/trash') return { name: 'trash' };
  return { name: 'rooms' };
}

/** Clé de la « page » chargée : changer de clé recharge la page. */
const pageKey = (r) => (r.name === 'room' ? `room:${r.roomId}` : r.name === 'missing' ? 'missing' : 'lobby');

export async function startApp(store) {
  try {
    await store.start();
  } catch (error) {
    console.error('Connexion Firebase refusée :', error?.code ?? error);
    showFatal('Impossible de se connecter au service temps réel. Vérifiez votre connexion, puis rechargez la page.');
    return;
  }

  let everConnected = false;
  store.onConnection((connected) => {
    everConnected ||= connected;
    const banner = $('banner');
    banner.hidden = connected || !everConnected;
    banner.textContent = 'Connexion perdue, reconnexion…';
  });

  closeDialogsOnBackdrop();

  const initial = route();
  const loaded = pageKey(initial);
  let lobby = null;
  let room = null;
  let reloading = false;

  // Écouté avant l'ouverture de la salle : un retour en arrière pendant le chargement est pris en compte.
  window.addEventListener('hashchange', async () => {
    const next = route();
    if (pageKey(next) === loaded) {
      lobby?.render();
      return;
    }
    if (reloading) return;
    reloading = true;
    try { await room?.leave(); } catch { /* départ au mieux : la présence s'efface aussi à la fermeture */ }
    location.reload();
  });

  if (initial.name === 'room') {
    store.useRoom(initial.roomId);
    room = await startRoom(store, initial.roomId);
  } else if (initial.name === 'missing') {
    showScreen('missing');
  } else {
    lobby = startLobby(store, route);
    showFlash();
  }
}
