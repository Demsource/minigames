type RouteHandler = (currentRoute: string) => HTMLElement;

export interface RouteChange {
  path: string;
  query: URLSearchParams;
  pathChanged: boolean;
}

type RouteListener = (change: RouteChange) => void;

interface SubscribeOptions {
  // Page-scoped listeners are dropped automatically when the page re-renders
  pageScoped?: boolean;
}

interface NavigateOptions {
  replace?: boolean;
}

export type QueryUpdate = Record<string, string | number | undefined>;

export class Router {
  private routes: Map<string, RouteHandler> = new Map();
  private rootElement: HTMLElement | undefined;
  private base: string;
  private currentPath: string | undefined;
  private globalListeners: Set<RouteListener> = new Set();
  private pageListeners: Set<RouteListener> = new Set();

  constructor(base: string = '') {
    this.base = base;
  }

  private writeUrl(url: string, shouldReplace = false) {
    const currentUrl =
      globalThis.location.pathname + globalThis.location.search;
    if (url === currentUrl) {
      return;
    }

    if (shouldReplace) {
      globalThis.history.replaceState({}, '', url);
    } else {
      globalThis.history.pushState({}, '', url);
    }
    this.handleRoute();
  }

  private renderPage(relativePath: string) {
    if (!this.rootElement) {
      return;
    }

    this.pageListeners.clear();
    const handler = this.routes.get(relativePath) || this.routes.get('/404');

    this.rootElement.replaceChildren();
    if (handler) {
      this.rootElement.append(handler(relativePath));
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

  public start(rootElement: HTMLElement) {
    this.rootElement = rootElement;

    // Handle GitHub Pages 404 redirect query string back into history state
    const parameters = new URLSearchParams(globalThis.location.search);
    const redirectedPath = parameters.get('p');
    if (redirectedPath) {
      const redirectedQuery = parameters.get('q');
      const search = redirectedQuery ? `?${redirectedQuery}` : '';
      globalThis.history.replaceState(
        {},
        '',
        this.base + redirectedPath + search + globalThis.location.hash
      );
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

    this.handleRoute();
  }

  public addRoute(path: string, handler: RouteHandler) {
    this.routes.set(path, handler);
  }

  public subscribe(
    listener: RouteListener,
    options: SubscribeOptions = {}
  ): () => void {
    const listeners = options.pageScoped
      ? this.pageListeners
      : this.globalListeners;
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  public getPath(): string {
    const pathname = globalThis.location.pathname;
    return pathname.startsWith(this.base)
      ? pathname.slice(this.base.length) || '/'
      : pathname;
  }

  public getQuery(): URLSearchParams {
    return new URLSearchParams(globalThis.location.search);
  }

  public navigateTo(path: string, options: NavigateOptions = {}) {
    this.writeUrl(this.base + path, options.replace);
  }

  // Merges updates into the current query; undefined or '' removes a key
  public setQuery(updates: QueryUpdate, options: NavigateOptions = {}) {
    const query = this.getQuery();
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || String(value).length === 0) {
        query.delete(key);
      } else {
        query.set(key, String(value));
      }
    }

    const search = query.toString();
    const url = globalThis.location.pathname + (search ? `?${search}` : '');
    this.writeUrl(url, options.replace);
  }

  public handleRoute() {
    const relativePath = this.getPath();
    const isPathChanged = relativePath !== this.currentPath;

    if (isPathChanged) {
      this.currentPath = relativePath;
      this.renderPage(relativePath);
    }

    const change: RouteChange = {
      path: relativePath,
      query: this.getQuery(),
      pathChanged: isPathChanged,
    };
    for (const listener of this.pageListeners) listener(change);
    for (const listener of this.globalListeners) listener(change);
  }
}

export const router = new Router('/minigames');
