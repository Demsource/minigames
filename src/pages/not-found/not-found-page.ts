import { Header } from '../../components/header/header';
import '../../components/header/header.scss';
import { Footer } from '../../components/footer/footer';
import './not-found-page.scss';

export function NotFound(currentRoute: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'page-container not-found-page';

  container.append(Header(currentRoute));

  const contentSection = document.createElement('div');
  contentSection.className = 'not-found-content';
  contentSection.innerHTML = `
    <h1>404 - Page Not Found</h1>
    <p>Sorry, the page you're looking for doesn't exist or has been moved.</p>
    <a href="/" class="btn-return-home" data-link>Return to Home Page</a>
  `;

  container.append(contentSection);
  container.append(Footer());

  return container;
}
