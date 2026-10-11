import './styles/main.scss';
import { router } from './app/router';
import { Home } from './pages/home/home-page';
import { Library } from './pages/library/library-page';
import { NotFound } from './pages/not-found/not-found-page';
import { initSession } from './services/session-state';
import {
  SESSION_EXPIRED_MESSAGE,
  SIGN_OUT_ERROR_MESSAGE,
  startSessionWatch,
} from './services/session-guard';
import { showSnackbar } from './components/snackbar/snackbar';

const appContainer = document.querySelector<HTMLElement>('#app');

if (appContainer) {
  // Restores a valid session synchronously; only the Firebase signOut for
  // missing/invalid/expired data runs in the background
  void initSession().then(({ status, signOut }) => {
    if (!signOut.success) {
      showSnackbar(SIGN_OUT_ERROR_MESSAGE);
    } else if (status === 'expired') {
      showSnackbar(SESSION_EXPIRED_MESSAGE);
    }
  });
  startSessionWatch();

  router.addRoute('/', Home);
  router.addRoute('/library', Library);
  router.addRoute('/404', NotFound);

  // Handle initial load
  router.start(appContainer);
}
