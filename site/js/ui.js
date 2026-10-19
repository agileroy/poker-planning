// Interface de la salle. Reçoit un « store » (Firebase en production, factice pour les essais)
// et ne contient aucune règle métier : tout calcul passe par poker-core.js.

import { CARDS, MESSAGES, validatePseudo, buildRoomView, cardByValue } from './poker-core.js';

const PSEUDO_STORAGE_KEY = 'poker-planning.pseudo';

const $ = (id) => document.getElementById(id);

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

function showScreen(name) {
  for (const id of ['screen-status', 'screen-pseudo', 'screen-room']) {
    $(id).hidden = id !== `screen-${name}`;
  }
}

export function showFatal(message) {
  showScreen('status');
  $('status-text').textContent = message;
  $('status-text').classList.add('is-error');
}

export async function startApp(store) {
  let raw = null;
  let view = null;
  let pseudo = null;          // pseudo actuel dans la salle (null tant qu'on n'y est pas)
  let everConnected = false;

  // ---------------------------------------------------------------- Connexion

  try {
    await store.start();
  } catch {
    showFatal('Impossible de se connecter au service temps réel. Vérifiez votre connexion, puis rechargez la page.');
    return;
  }

  store.onConnection((connected) => {
    everConnected ||= connected;
    const banner = $('banner');
    banner.hidden = connected || !everConnected;
    banner.textContent = 'Connexion perdue, reconnexion…';
  });

  const firstRoom = new Promise((resolve) => {
    store.onRoom((value) => {
      raw = value;
      resolve();
      render();
    });
  });
  await firstRoom;

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
      if (!(await store.claimPseudo(checked.pseudo))) return MESSAGES.pseudoTaken;
      await store.enter(checked.pseudo);
    }
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

  $('reveal').addEventListener('click', () => view?.canReveal && store.reveal(view.round));
  $('new-round').addEventListener('click', () => view && store.newRound(view.round));

  // ---------------------------------------------------------------- Rendu

  function render() {
    if (!raw || pseudo === null) return;
    view = buildRoomView(raw, store.uid);

    // Présents
    const list = $('participants');
    list.replaceChildren(...view.participants.map((p) => {
      const item = document.createElement('li');
      item.className = 'participant';
      const name = document.createElement('span');
      name.className = 'participant-name';
      name.textContent = p.pseudo;
      if (p.isMe) {
        const you = document.createElement('span');
        you.className = 'participant-you';
        you.textContent = '(vous)';
        name.append(you);
      }
      const mini = document.createElement('span');
      mini.className = 'mini-card';
      if (view.revealed && p.vote !== null) {
        mini.classList.add('is-face');
        mini.append(cardContent(p.vote));
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

    const total = view.participants.length;
    $('vote-count').textContent = `${view.voteCount} / ${total} ${view.voteCount > 1 ? 'votes' : 'vote'}`;

    // Cartes
    for (const button of deck.children) {
      const selected = button.dataset.value === view.myVote;
      button.setAttribute('aria-pressed', String(selected));
      button.disabled = !view.canVote;
    }
    $('deck-hint').textContent = view.revealed
      ? 'Cartes révélées : votes figés jusqu\'au prochain « Nouveau vote ».'
      : view.myVote !== null ? 'Recliquez sur votre carte pour retirer votre vote.' : '';

    $('reveal').disabled = !view.canReveal;

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
      $('consensus').hidden = results.consensus === null;
      $('consensus').textContent = results.consensus === null ? '' : `Consensus : ${results.consensus}`;
      const alert = $('scissors-alert');
      alert.hidden = results.scissorsCount === 0;
      alert.replaceChildren(cardContent('scissors'),
        `Story à découper ? (${results.scissorsCount} ${results.scissorsCount > 1 ? 'cartes ciseaux' : 'carte ciseaux'})`);
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

}
