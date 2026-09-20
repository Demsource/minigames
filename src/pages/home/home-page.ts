// src/pages/home.ts
export function Home(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'page-container';
  container.innerHTML = `
    <h1>Home Page</h1>
    <p>Welcome to the minigames app!</p>
    <a href="/library" data-link class="nav-link">Go to Library</a>
  `;
  return container;
}
