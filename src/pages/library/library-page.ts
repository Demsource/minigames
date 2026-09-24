import { Header } from '../../components/header/header';
import '../../components/header/header.scss';
import { PageTitle } from '../../components/page-title/page-title';
import { Footer } from '../../components/footer/footer';
import './library-page.scss';

export function Library(currentRoute: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'page-container';

  container.append(Header(currentRoute));
  container.append(
    PageTitle({
      title: 'Game Library',
      subtitle: 'Browse our collection of casual mini-games',
    })
  );
  container.append(Footer());
  return container;
}
