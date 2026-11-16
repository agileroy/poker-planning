// Liste des salles, création et corbeille. Ne parle à Firebase qu'à travers le store.
import {
  buildRoomsView, validateRoomName, roomNameConflict, newRoomId, presentLabel, roomHash,
  createRoomUpdate, restoreRoomUpdate, purgeRoomUpdate,
} from './poker-core.js?v=__VERSION__';
import { $, h, APP_NAME, SAVE_FAILED, showScreen, showFatal, toast, ask, roomUrl, copyText } from './widgets.js?v=__VERSION__';

export function startLobby(store, route) {
  let rooms = null;

  async function save(update) {
    const ok = await store.apply(update);
    if (!ok) toast(SAVE_FAILED, 'error');
    return ok;
  }

  function setActiveNav(name) {
    document.querySelectorAll('[data-nav]').forEach((a) => {
      if (a.dataset.nav === name) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function renderRooms() {
    const { active } = buildRoomsView(rooms);
    $('room-list').replaceChildren(...active.map((r) => h('li', { class: 'room-row' },
      h('a', { href: roomHash(r.id), class: 'room-link' },
        h('span', { class: 'room-name' }, r.name),
        h('span', { class: `room-meta${r.presentCount ? ' is-busy' : ''}` }, presentLabel(r.presentCount))),
      h('button', {
        type: 'button',
        class: 'button button-ghost button-small copy-link',
        'aria-label': `Copier le lien de la salle « ${r.name} »`,
        onclick: async () => {
          const url = roomUrl(roomHash(r.id));
          if (await copyText(url)) toast(`Lien de « ${r.name} » copié.`);
          else toast(`Copie impossible : ${url}`, 'error');
        },
      }, 'Copier le lien'))));
    $('rooms-empty').hidden = active.length > 0;
    showScreen('rooms');
  }

  function renderTrash() {
    const { trash } = buildRoomsView(rooms);
    const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' });
    $('trash-list').replaceChildren(...trash.map((r) => h('li', {},
      h('div', {},
        h('span', { class: 'room-name' }, r.name),
        h('span', { class: 'room-meta' }, `Supprimée le ${dateFmt.format(new Date(r.deletedAt))}`)),
      h('div', { class: 'row-actions' },
        h('button', {
          type: 'button',
          class: 'button button-ghost button-small',
          onclick: async () => {
            if (await save(restoreRoomUpdate(r.id))) toast(`Salle « ${r.name} » restaurée.`);
          },
        }, 'Restaurer'),
        h('button', {
          type: 'button',
          class: 'button button-danger button-small',
          onclick: async () => {
            const confirmed = await ask({
              title: `Supprimer « ${r.name} » définitivement ?`,
              text: 'La salle et son lien seront effacés, et son nom redeviendra disponible. Cette action est irréversible.',
              ok: 'Supprimer définitivement',
            });
            if (confirmed && await save(purgeRoomUpdate(r))) toast(`Salle « ${r.name} » supprimée définitivement.`);
          },
        }, 'Supprimer définitivement')))));
    $('trash-empty').hidden = trash.length > 0;
    showScreen('trash');
  }

  function render() {
    if (rooms === null) return;
    const name = route().name;
    document.title = name === 'trash' ? `Corbeille · ${APP_NAME}` : APP_NAME;
    setActiveNav(name);
    if (name === 'trash') renderTrash();
    else renderRooms();
  }

  $('room-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = $('room-input');
    const error = $('room-error');
    const checked = validateRoomName(input.value);
    const message = checked.ok ? roomNameConflict(rooms, checked.name) : checked.error;
    if (message) {
      error.textContent = message;
      input.focus();
      return;
    }
    error.textContent = '';
    // Code tiré hors des salles connues ; si la base le refuse (salle créée entre-temps), autre essai.
    const taken = Object.keys(rooms ?? {});
    for (let attempt = 0; attempt < 3; attempt++) {
      const id = newRoomId(taken);
      if (await store.apply(createRoomUpdate(id, checked.name))) {
        input.value = '';
        location.hash = roomHash(id);
        return;
      }
      taken.push(id);
    }
    toast(SAVE_FAILED, 'error');
  });
  $('room-input').addEventListener('input', () => { $('room-error').textContent = ''; });

  store.onRooms((next) => {
    rooms = next;
    render();
  }, () => showFatal('Lecture des salles refusée par la base. Vérifiez que les règles de sécurité sont publiées.'));

  return { render };
}
