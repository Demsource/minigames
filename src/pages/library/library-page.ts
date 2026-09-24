import { Header } from '../../components/header/header';
import '../../components/header/header.scss';
import { Footer } from '../../components/footer/footer';

export function Library(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'page-container';

  container.append(Header());
  container.append(Footer());
  return container;
}
