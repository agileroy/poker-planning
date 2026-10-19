// Point d'entrée : branche l'interface sur Firebase.
import { firebaseConfig } from './firebase-config.js';
import { startApp, showFatal } from './ui.js';

if (!firebaseConfig) {
  showFatal('Configuration Firebase manquante : renseignez site/js/firebase-config.js.');
} else {
  import('./room-store.js')
    .then(({ createRoomStore }) => startApp(createRoomStore(firebaseConfig)))
    .catch(() => showFatal('Impossible de charger le service temps réel. Vérifiez votre connexion, puis rechargez la page.'));
}
