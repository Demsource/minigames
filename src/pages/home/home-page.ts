import { Header } from '../../components/header/header';
import '../../components/header/header.scss';
import { Hero } from '../../components/hero/hero';
import { NewGames } from '../../components/new-games/new-games';
import { Leaderboard } from '../../components/leaderboard/leaderboard';
import { DeveloperCta } from '../../components/developer-cta/developer-cta';
import { Footer } from '../../components/footer/footer';
import './home-page.scss';
export function Home(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'page-container';

  container.append(Header());
  container.append(Hero());
  container.append(NewGames());
  container.append(Leaderboard());
  container.append(DeveloperCta());
  container.append(Footer());

  return container;
}
