import './styles/main.scss';
import { router } from './app/router';
import { Home } from './pages/home/home-page';
import { Library } from './pages/library/library-page';
import { NotFound } from './pages/not-found/not-found-page';
import { initSession } from './services/session-state';
import { showSnackbar } from './components/snackbar/snackbar';

const appContainer = document.querySelector<HTMLElement>('#app');

if (appContainer) {
  // Restores a valid session synchronously; only the Firebase signOut for
  // missing/invalid/expired data runs in the background
  void initSession().then((result) => {
    if (result === 'expired') {
      showSnackbar('Your session has expired. You are now in Guest Mode.');
    }
  });

  router.addRoute('/', Home);
  router.addRoute('/library', Library);
  router.addRoute('/404', NotFound);

  // Handle initial load
  router.start(appContainer);
}
