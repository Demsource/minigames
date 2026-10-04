import './styles/main.scss';
import { router } from './app/router';
import { Home } from './pages/home/home-page';
import { Library } from './pages/library/library-page';
import { NotFound } from './pages/not-found/not-found-page';

const appContainer = document.querySelector<HTMLElement>('#app');

if (appContainer) {
  router.addRoute('/', Home);
  router.addRoute('/library', Library);
  router.addRoute('/404', NotFound);

  // Handle initial load
  router.start(appContainer);
}
