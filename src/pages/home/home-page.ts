import { Header } from '../../components/header/header';
import '../../components/header/header.scss';
import { Hero } from '../../components/hero/hero';
import { NewGames } from '../../components/new-games/new-games';
import './home-page.scss';
export function Home(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'page-container';

  container.append(Header());
  container.append(Hero());
  container.append(NewGames());

  return container;
}
