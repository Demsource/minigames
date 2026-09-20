import './styles/main.scss';
import { Router } from './app/router';
import { Home } from './pages/home/home-page';
import { Library } from './pages/library/library-page';

const appContainer = document.querySelector<HTMLElement>('#app');

if (appContainer) {
  const router = new Router(appContainer, '/minigames');

  router.addRoute('/', Home);
  router.addRoute('/library', Library);

  // Handle initial load
  router.handleRoute();
}
