// src/pages/library.ts
export function Library(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'page-container';
  container.innerHTML = `
    <h1>Library Page</h1>
    <p>Explore your game library here.</p>
    <a href="/" data-link class="nav-link">Go Home</a>
  `;
  return container;
}
