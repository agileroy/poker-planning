// Utilitaires d'interface partagés par la liste des salles et la salle : écrans,
// création d'éléments, notification, boîte de dialogue de confirmation ou de saisie.

export const $ = (id) => document.getElementById(id);

export const APP_NAME = 'Poker planning';
export const SAVE_FAILED = 'La modification n\'a pas été enregistrée. Vérifiez la connexion, puis réessayez.';

const SCREENS = ['status', 'rooms', 'trash', 'missing', 'pseudo', 'left', 'room'];

/** Affiche un écran ; l'en-tête de salle et la navigation suivent. */
export function showScreen(name) {
  for (const screen of SCREENS) $(`screen-${screen}`).hidden = screen !== name;
  $('room-head').hidden = name !== 'room';
  $('nav').hidden = !['rooms', 'trash', 'missing'].includes(name);
}

export function showFatal(message) {
  showScreen('status');
  $('status-text').textContent = message;
  $('status-text').classList.add('is-error');
}

export function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else if (k === 'class') node.className = v;
    else node.setAttribute(k, v === true ? '' : v);
  }
  node.append(...children.flat().filter((c) => c != null && c !== false));
  return node;
}

let toastTimer;
export function toast(message, tone = 'info') {
  const el = $('toast');
  el.textContent = message;
  el.dataset.tone = tone;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 4500);
}

// Message à afficher après le rechargement qui suit un changement de salle.
const FLASH_KEY = 'poker-planning.flash';
export function setFlash(message) {
  try { sessionStorage.setItem(FLASH_KEY, message); } catch { /* stockage indisponible */ }
}
export function showFlash() {
  let message = null;
  try {
    message = sessionStorage.getItem(FLASH_KEY);
    sessionStorage.removeItem(FLASH_KEY);
  } catch { /* stockage indisponible */ }
  if (message) toast(message);
}

/**
 * Confirmation (sans `label`) ou saisie (avec `label`). `check(value)` renvoie un
 * message d'erreur pour garder la boîte ouverte. Résout la valeur, true, ou null si annulé.
 */
export function ask({ title, text = '', label, value = '', ok, check }) {
  const dialog = $('ask');
  const form = $('ask-form');
  const input = $('ask-input');
  const error = $('ask-error');
  $('ask-title').textContent = title;
  $('ask-text').textContent = text;
  $('ask-text').hidden = !text;
  $('ask-field').hidden = !label;
  $('ask-label').textContent = label ?? '';
  $('ask-ok').textContent = ok;
  input.value = value;
  error.textContent = '';

  return new Promise((resolve) => {
    const onSubmit = (event) => {
      if (event.submitter?.value !== 'ok' || !label || !check) return;
      const message = check(input.value);
      if (message) {
        event.preventDefault();
        error.textContent = message;
        input.focus();
      }
    };
    const onInput = () => { error.textContent = ''; };
    form.addEventListener('submit', onSubmit);
    input.addEventListener('input', onInput);
    dialog.returnValue = 'cancel';
    dialog.addEventListener('close', () => {
      form.removeEventListener('submit', onSubmit);
      input.removeEventListener('input', onInput);
      if (dialog.returnValue !== 'ok') return resolve(null);
      resolve(label ? input.value : true);
    }, { once: true });
    dialog.showModal();
    if (label) input.select();
  });
}

/** Clic sur le fond d'une boîte de dialogue : la fermer. */
export function closeDialogsOnBackdrop() {
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  });
}
