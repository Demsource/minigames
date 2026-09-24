import { Header } from '../../components/header/header';
import '../../components/header/header.scss';
import { Footer } from '../../components/footer/footer';
import './library-page.scss';

export function Library(currentRoute: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'page-container';

  container.append(Header(currentRoute));
  container.append(Footer());
  return container;
}
