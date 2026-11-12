// Interface d'une salle. Reçoit un « store » (Firebase en production, factice pour les essais)
// et ne contient aucune règle métier : tout calcul passe par poker-core.js.
// Une page n'ouvre qu'une salle : en changer recharge la page (voir ui.js).

import { launchConfetti } from './confetti.js?v=__VERSION__';
import { CARDS, MESSAGES, validatePseudo, buildRoomView, cardByValue, voteCountLabel, allVotersVoted, AUTO_REVEAL_SECONDS, questionMessage, gapMessage, waitingFor, waitingMessage, HEARTBEAT_MS, SWEEP_MS, roomInfo, validateRoomName, roomNameConflict, renameRoomUpdate, trashRoomUpdate } from './poker-core.js?v=__VERSION__';
import { $, APP_NAME, SAVE_FAILED, showScreen, showFatal, toast, ask, setFlash } from './widgets.js?v=__VERSION__';

const PSEUDO_STORAGE_KEY = 'poker-planning.pseudo';
const ROLE_STORAGE_KEY = 'poker-planning.role';

function readStoredRole() {
  try { return localStorage.getItem(ROLE_STORAGE_KEY) === 'observer' ? 'observer' : 'voter'; } catch { return 'voter'; }
}
function storeRole(role) {
  try { localStorage.setItem(ROLE_STORAGE_KEY, role); } catch { /* stockage indisponible */ }
}

const EYE_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';

/** Mention « (vous) » à côté de son propre pseudo. */
function youTag() {
  const you = document.createElement('span');
  you.className = 'participant-you';
  you.textContent = '(vous)';
  return you;
}

function readStoredPseudo() {
  try { return localStorage.getItem(PSEUDO_STORAGE_KEY) ?? ''; } catch { return ''; }
}
function storePseudo(pseudo) {
  try { localStorage.setItem(PSEUDO_STORAGE_KEY, pseudo); } catch { /* stockage indisponible */ }
}

/** Contenu visuel d'une carte : texte, ou icône ciseaux avec texte alternatif. */
function cardContent(value) {
  const card = cardByValue(value);
  if (card?.alt) {
    const icon = document.createElement('span');
    icon.className = 'scissors-icon';
    icon.setAttribute('role', 'img');
    icon.setAttribute('aria-label', card.alt);
    return icon;
  }
  return document.createTextNode(card?.label ?? value);
}

/**
 * Ouvre la salle `roomId` (store déjà connecté et réglé sur cette salle).
 * Renvoie { leave } : quitte la salle avant de changer de page.
 */
export async function startRoom(store, roomId, { sweepMs = SWEEP_MS, heartbeatMs = HEARTBEAT_MS } = {}) {
  let raw = null;
  let room = null;            // { id, name, deletedAt } ; null si la salle n'existe pas
  let view = null;
  let pseudo = null;          // pseudo actuel dans la salle (null tant qu'on n'y est pas)
  let seenInRoom = false;     // vrai dès que sa fiche est apparue dans la salle
  let wasRevealed = null;     // état de la révélation au rendu précédent (null : premier rendu)
  let closed = false;         // salle mise à la corbeille ou supprimée pendant la visite
  let closingByMe = false;    // c'est ce navigateur qui la met à la corbeille
  let countdown = null;       // décompte de la révélation automatique : { timer, remaining }

  // ---------------------------------------------------------------- Salle

  let firstLoad;
  const firstRoom = new Promise((resolve) => { firstLoad = resolve; });
  store.onRoom((value) => {
    raw = value ?? {};
    room = roomInfo(roomId, value);
    firstLoad();
    showRoomName();
    render();
  }, () => {
    firstLoad();
    showFatal('Lecture de la salle refusée par la base. Vérifiez que les règles de sécurité sont publiées.');
  });
  await firstRoom;

  /** Nom de la salle dans l'en-tête, le titre de l'onglet et l'écran de pseudo. */
  function showRoomName() {
    if (!room) return;
    $('room-title').textContent = room.name;
    $('pseudo-room').textContent = `Salle « ${room.name} »`;
    document.title = `${room.name} · ${APP_NAME}`;
  }

  /** Salle absente, ou passée à la corbeille : plus de présence, message et lien vers la liste. */
  function showClosed() {
    const wasInside = pseudo !== null;
    closed = true;
    stopCountdown();
    pseudo = null;
    $('me').hidden = true;
    if (wasInside) store.stopPresence();
    document.title = APP_NAME;
    const trashed = room?.deletedAt != null;
    $('missing-title').textContent = trashed ? 'Salle fermée' : 'Salle introuvable';
    $('missing-text').textContent = trashed
      ? 'Cette salle a été mise à la corbeille.'
      : 'Cette salle n\'existe pas ou a été mise à la corbeille.';
    showScreen('missing');
  }

  if (!room || room.deletedAt !== null) {
    showClosed();
    return { leave: async () => {} };
  }

  // ---------------------------------------------------------------- Pseudo

  const form = $('pseudo-form');
  const input = $('pseudo-input');
  const error = $('pseudo-error');

  function openPseudoForm({ value = '', message = '', cancellable = false } = {}) {
    input.value = value;
    setError(message);
    $('pseudo-cancel').hidden = !cancellable;
    $('pseudo-submit').textContent = cancellable ? 'Changer' : 'Entrer dans la salle';
    form.querySelector('h2').textContent = cancellable ? 'Changer de pseudo' : 'Bienvenue !';
    showScreen('pseudo');
    input.focus();
  }

  function setError(message) {
    error.textContent = message;
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  async function enterWith(candidate) {
    const checked = validatePseudo(candidate);
    if (!checked.ok) return checked.error;
    if (pseudo !== null) {
      if (!(await store.changePseudo(pseudo, checked.pseudo))) return MESSAGES.pseudoTaken;
    } else {
      if (!(await store.claimPseudo(checked.pseudo))) {
        return closed ? null : MESSAGES.pseudoTaken;
      }
      try {
        await store.enter(checked.pseudo);
        await store.setObserver(readStoredRole() === 'observer');
      } catch {
        return closed ? null : SAVE_FAILED;   // salle fermée entre-temps : l'écran « fermée » est déjà affiché
      }
    }
    if (closed) return null;
    pseudo = checked.pseudo;
    storePseudo(pseudo);
    $('me-name').textContent = pseudo;
    $('me').hidden = false;
    showScreen('room');
    render();
    return null;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = $('pseudo-submit');
    submit.disabled = true;
    const message = await enterWith(input.value);
    submit.disabled = false;
    if (message) {
      setError(message);
      input.focus();
    }
  });

  input.addEventListener('input', () => setError(''));

  $('pseudo-cancel').addEventListener('click', () => {
    showScreen('room');
  });

  function showLeft(title) {
    if (closed) return;
    stopCountdown();
    pseudo = null;            // plus aucun rendu de la salle
    wasRevealed = null;
    seenInRoom = false;
    $('me').hidden = true;
    $('left-title').textContent = title;
    showScreen('left');
  }

  function kicked() {
    showLeft(MESSAGES.kicked);
    store.stopPresence();
  }

  // Retrait automatique : chaque navigateur présent retire les inactifs (jamais lui-même).
  setInterval(() => {
    if (!raw || pseudo === null) return;
    const targets = buildRoomView(raw, store.uid, store.serverNow()).inactive;
    if (targets.length) store.removeParticipants(targets.map((p) => p.uid));
  }, sweepMs);

  // Activité due aux interactions avec l'onglet affiché, enregistrée au plus toutes les 5 minutes.
  let lastHeartbeat = Date.now();
  const heartbeat = () => {
    if (pseudo === null || document.visibilityState !== 'visible') return;
    if (Date.now() - lastHeartbeat < heartbeatMs) return;
    lastHeartbeat = Date.now();
    store.touch();
  };
  for (const type of ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart']) {
    document.addEventListener(type, heartbeat, { passive: true });
  }

  // ---------------------------------------------------------------- Rejoindre avec un téléphone

  const joinUrl = `${location.origin}${location.pathname}#/room/${roomId}`;   // adresse de cette salle
  const joinLabel = joinUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  $('join-url').textContent = joinLabel;
  $('qr-dialog-url').textContent = joinLabel;

  const qrSvg = (() => {
    try {
      const qr = window.qrcode(0, 'M');
      qr.addData(joinUrl);
      qr.make();
      return qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true, alt: `QR code : ${joinLabel}` });
    } catch {
      return null;                       // bibliothèque indisponible : pas de carte QR code
    }
  })();
  if (qrSvg) {
    $('qr-small').innerHTML = qrSvg;
    $('qr-large').innerHTML = qrSvg;
    $('join-card').hidden = false;
  }

  const dialog = $('qr-dialog');
  $('qr-open').addEventListener('click', () => dialog.showModal());
  $('qr-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

  $('share-link').addEventListener('click', async () => {
    const status = $('share-status');
    if (navigator.share) {
      try { await navigator.share({ title: `${APP_NAME} · ${room?.name ?? ''}`, url: joinUrl }); return; } catch (error) {
        if (error?.name === 'AbortError') return;      // partage annulé par l'utilisateur
      }
    }
    try {
      await navigator.clipboard.writeText(joinUrl);
      status.textContent = 'Lien copié';
    } catch {
      status.textContent = joinLabel;                  // dernier recours : afficher l'adresse
    }
    setTimeout(() => { status.textContent = ''; }, 4000);
  });

  $('leave').addEventListener('click', async () => {
    const leaving = pseudo;
    showLeft('Vous avez quitté la salle');
    await store.leave(leaving);
    // Accepté seulement si l'onglet a été ouvert par un script ; sinon l'écran « quitté » reste affiché.
    window.close();
  });

  $('rejoin').addEventListener('click', () => location.reload());

  // ---------------------------------------------------------------- Renommer, corbeille

  $('room-rename').addEventListener('click', async () => {
    if (!room || closed) return;
    let rooms = null;
    try { rooms = await store.getRooms(); } catch { /* la base vérifie de toute façon l'unicité */ }
    let name;
    const value = await ask({
      title: 'Renommer la salle',
      label: 'Nom de la salle',
      value: room.name,
      ok: 'Renommer',
      check: (input) => {
        const checked = validateRoomName(input);
        if (!checked.ok) return checked.error;
        const conflict = rooms && roomNameConflict(rooms, checked.name, roomId);
        if (conflict) return conflict;
        name = checked.name;
        return null;
      },
    });
    if (value == null || !room || closed || name === room.name) return;
    if (!(await store.apply(renameRoomUpdate(room, name)))) toast(SAVE_FAILED, 'error');
  });

  $('room-trash').addEventListener('click', async () => {
    if (!room || closed) return;
    const others = view ? view.participants.filter((p) => !p.isMe).length : 0;
    const confirmed = await ask({
      title: `Mettre « ${room.name} » à la corbeille ?`,
      text: (others > 0
        ? `${others} ${others > 1 ? 'autres participants sont' : 'autre participant est'} dans la salle : elle se fermera pour ${others > 1 ? 'eux' : 'lui ou elle'}, et le vote en cours sera perdu. `
        : 'Le vote en cours sera perdu. ')
        + 'Vous pourrez la restaurer depuis la corbeille, avec le même lien.',
      ok: 'Mettre à la corbeille',
    });
    if (!confirmed || !room || closed) return;
    const name = room.name;
    closingByMe = true;
    stopCountdown();
    if (await store.apply(trashRoomUpdate(roomId))) {
      pseudo = null;            // la mise à la corbeille a déjà retiré tous les présents
      setFlash(`Salle « ${name} » mise à la corbeille.`);
      location.hash = '#/';
    } else {
      closingByMe = false;
      toast(SAVE_FAILED, 'error');
    }
  });

  $('change-pseudo').addEventListener('click', () =>
    openPseudoForm({ value: pseudo ?? '', cancellable: true }));

  // ---------------------------------------------------------------- Jeu de cartes

  const deck = $('deck');
  for (const card of CARDS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'card';
    button.dataset.value = card.value;
    button.setAttribute('aria-pressed', 'false');
    button.append(cardContent(card.value));
    button.addEventListener('click', () => {
      if (!view || !view.canVote) return;
      if (view.myVote === card.value) store.clearVote();
      else store.vote(card.value, view.round);
    });
    deck.append(button);
  }

  for (const [id, role] of [['role-voter', 'voter'], ['role-observer', 'observer']]) {
    $(id).addEventListener('click', () => {
      if (!view || (role === 'observer') === Boolean(view.me?.observer)) return;
      storeRole(role);
      store.setObserver(role === 'observer');
    });
  }

  $('auto-reveal').addEventListener('change', (event) => store.setAutoReveal(event.target.checked));

  // Révélation automatique : décompte local, annulé dès que la condition ne tient plus.
  function stopCountdown() {
    if (!countdown) return;
    clearInterval(countdown.timer);
    countdown = null;
    $('countdown').hidden = true;
  }
  function updateCountdown() {
    const ready = view && view.autoReveal && allVotersVoted(view);
    if (!ready) { stopCountdown(); return; }
    if (countdown) return;                       // déjà lancé : un changement de carte ne le relance pas
    countdown = { remaining: AUTO_REVEAL_SECONDS };
    const show = () => {
      $('countdown').textContent = `Révélation dans ${countdown.remaining}…`;
      $('countdown').hidden = false;
    };
    show();
    countdown.timer = setInterval(() => {
      countdown.remaining -= 1;
      if (countdown.remaining > 0) { show(); return; }
      const round = view.round;
      const stillReady = view.autoReveal && allVotersVoted(view);
      stopCountdown();
      if (stillReady) store.reveal(round);
    }, 1000);
  }

  $('reveal').addEventListener('click', () => view?.canReveal && store.reveal(view.round));
  $('new-round').addEventListener('click', () => view && store.newRound(view.round));
  $('new-round-big').addEventListener('click', () => view && store.newRound(view.round));

  // Halo de « Nouveau vote » pendant 4 s après la révélation.
  let haloTimer = null;
  function highlightNewRound() {
    clearTimeout(haloTimer);
    for (const id of ['new-round', 'new-round-big']) $(id).classList.add('is-highlighted');
    haloTimer = setTimeout(clearHalo, 4000);
  }
  function clearHalo() {
    clearTimeout(haloTimer);
    for (const id of ['new-round', 'new-round-big']) $(id).classList.remove('is-highlighted');
  }

  // ---------------------------------------------------------------- Rendu

  function render() {
    if (closingByMe) return;
    if (!closed && (!room || room.deletedAt !== null)) {
      showClosed();
      return;
    }
    if (!raw || pseudo === null) return;
    // Retiré par un autre participant (inactivité) : sa fiche a disparu de la salle.
    if (seenInRoom && !raw.participants?.[store.uid]) {
      kicked();
      return;
    }
    view = buildRoomView(raw, store.uid, store.serverNow());
    if (view.me) seenInRoom = true;

    // Courte vibration à la révélation (téléphones qui le permettent), jamais au premier rendu.
    if (wasRevealed === false && view.revealed) {
      try { navigator.vibrate?.(150); } catch { /* API absente ou refusée */ }
      highlightNewRound();
      if (view.results?.consensus) launchConfetti();
    }
    wasRevealed = view.revealed;

    // Présents : uniquement les participants qui votent.
    const list = $('participants');
    list.replaceChildren(...view.voters.map((p) => {
      const item = document.createElement('li');
      item.className = 'participant';
      const name = document.createElement('span');
      name.className = 'participant-name';
      name.textContent = p.pseudo;
      if (p.isMe) name.append(youTag());
      const mini = document.createElement('span');
      mini.className = 'mini-card';
      if (view.revealed && p.vote !== null) {
        mini.classList.add('is-face');
        mini.append(cardContent(p.vote));
        if (p.extreme) {
          mini.classList.add('is-extreme', `extreme-${p.extreme}`);
          mini.setAttribute('role', 'img');
          mini.setAttribute('aria-label', `${cardByValue(p.vote)?.alt ?? p.vote}, ${p.extreme === 'low' ? 'vote le plus bas' : 'vote le plus haut'}`);
        }
      } else if (p.hasVoted) {
        mini.classList.add('is-back');
        mini.setAttribute('role', 'img');
        mini.setAttribute('aria-label', 'a voté');
        mini.title = 'A voté';
      } else {
        mini.classList.add('is-empty');
        mini.setAttribute('role', 'img');
        mini.setAttribute('aria-label', 'pas encore voté');
      }
      item.append(name, mini);
      return item;
    }));
    $('no-voter').hidden = view.voters.length > 0;

    // Observateurs : encadré à part, masqué s'il n'y en a pas.
    $('observers-panel').hidden = view.observers.length === 0;
    $('observer-count').textContent = String(view.observers.length);
    $('observers').replaceChildren(...view.observers.map((p) => {
      const item = document.createElement('li');
      item.className = 'observer-chip';
      item.innerHTML = EYE_ICON;
      item.append(p.pseudo);
      if (p.isMe) item.append(youTag());
      return item;
    }));

    $('vote-count').textContent = voteCountLabel(view);
    const waiting = waitingFor(view);
    $('waiting').hidden = waiting.length === 0;
    $('waiting-text').textContent = waiting.length ? waitingMessage(waiting) : '';

    // Rôle
    const observing = Boolean(view.me?.observer);
    $('role-voter').setAttribute('aria-checked', String(!observing));
    $('role-observer').setAttribute('aria-checked', String(observing));
    // Étape suivante mise en valeur : « Révéler » pendant le vote, « Nouveau vote » après.
    $('screen-room').classList.toggle('is-revealed', view.revealed);
    $('reveal').classList.toggle('button-primary', !view.revealed);
    $('reveal').classList.toggle('button-ghost', view.revealed);
    $('new-round').classList.toggle('button-primary', view.revealed);
    $('new-round').classList.toggle('button-ghost', !view.revealed);
    if (!view.revealed) clearHalo();
    $('relaunch').hidden = !view.revealed;
    deck.hidden = observing || view.revealed;
    $('observer-note').hidden = !observing || view.revealed;

    // Cartes
    for (const button of deck.children) {
      const selected = button.dataset.value === view.myVote;
      button.setAttribute('aria-pressed', String(selected));
      button.disabled = !view.canVote;
    }
    $('deck-hint').hidden = view.revealed;
    $('deck-hint').textContent = observing ? '' : view.revealed
      ? 'Cartes révélées : votes figés jusqu\'au prochain « Nouveau vote ».'
      : view.myVote !== null ? 'Recliquez sur votre carte pour retirer votre vote.' : '';

    $('reveal').disabled = !view.canReveal;
    $('auto-reveal').checked = view.autoReveal;
    updateCountdown();

    // Résultats
    const results = view.results;
    $('results').hidden = !results;
    if (results) {
      $('mean').textContent = results.meanLabel;
      $('distribution').replaceChildren(...results.distribution.map((entry) => {
        const li = document.createElement('li');
        li.append(`${entry.count} × `, cardContent(entry.value));
        return li;
      }));
      const extremes = results.extremes;
      $('extremes').hidden = !extremes;
      if (extremes) {
        for (const side of ['low', 'high']) {
          const value = document.createElement('span');
          value.className = 'extreme-value';
          value.textContent = extremes[side].value;
          $(`extreme-${side}`).replaceChildren(value, extremes[side].pseudos.join(', '));
        }
      }
      $('gap').hidden = !results.gap;
      if (results.gap) {
        const { title, simpler, harder } = gapMessage(results.gap);
        $('gap-title').textContent = title;
        $('gap-simpler').textContent = simpler;
        $('gap-harder').textContent = harder;
      }
      $('consensus').hidden = results.consensus === null;
      $('consensus').textContent = results.consensus === null ? '' : `Consensus : ${results.consensus}`;
      const question = questionMessage(results.questionPseudos);
      $('question-alert').hidden = !question;
      if (question) {
        $('question-title').textContent = question.title;
        $('question-text').textContent = question.text;
      }
      $('scissors-alert').hidden = results.scissorsCount === 0;
      $('scissors-text').textContent = results.scissorsCount > 1
        ? `${results.scissorsCount} cartes ciseaux jouées.` : '1 carte ciseaux jouée.';
    }
  }

  // ---------------------------------------------------------------- Arrivée

  const stored = readStoredPseudo();
  if (stored && validatePseudo(stored).ok) {
    const message = await enterWith(stored);
    if (message) openPseudoForm({ value: stored, message });
  } else {
    openPseudoForm();
  }

  return {
    /** Quitte la salle (présence, vote non révélé, pseudo), avant d'afficher une autre page. */
    async leave() {
      if (pseudo === null) return;
      const leaving = pseudo;
      pseudo = null;
      stopCountdown();
      await store.leave(leaving);
    },
  };
}
