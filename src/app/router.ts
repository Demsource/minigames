type RouteHandler = () => HTMLElement;

export class Router {
  private routes: Map<string, RouteHandler> = new Map();
  private rootElement: HTMLElement;
  private base: string;

  constructor(rootElement: HTMLElement, base: string = '') {
    this.rootElement = rootElement;
    this.base = base;

    // Handle GitHub Pages 404 redirect query string back into history state
    const parameters = new URLSearchParams(globalThis.location.search);
    const redirectedPath = parameters.get('p');
    if (redirectedPath) {
      globalThis.history.replaceState({}, '', this.base + redirectedPath);
    }

    globalThis.addEventListener('popstate', () => this.handleRoute());

    // Intercept internal link clicks
    document.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest('a');
      if (!target || !target.matches('[data-link]')) {
        return;
      }

      event.preventDefault();
      const href = target.getAttribute('href');
      if (!href) {
        return;
      }

      this.navigateTo(href);
    });
  }

  public addRoute(path: string, handler: RouteHandler) {
    this.routes.set(path, handler);
  }

  public navigateTo(path: string) {
    globalThis.history.pushState({}, '', this.base + path);
    this.handleRoute();
  }

  public handleRoute() {
    const pathname = globalThis.location.pathname;
    const relativePath = pathname.startsWith(this.base)
      ? pathname.slice(this.base.length) || '/'
      : pathname;

    const handler = this.routes.get(relativePath) || this.routes.get('/404');

    this.rootElement.replaceChildren();
    if (handler) {
      this.rootElement.append(handler());
    } else {
      this.rootElement.innerHTML = `
  <div class="page-container not-found">
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
    <a href="/" data-link class="nav-link">Go Home</a>
  </div>
`;
    }
  }
}
