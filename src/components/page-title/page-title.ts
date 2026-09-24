import './page-title.scss';

interface PageTitleProperties {
  title: string;
  subtitle: string;
}

export function PageTitle({
  title,
  subtitle,
}: PageTitleProperties): HTMLElement {
  const section = document.createElement('section');
  section.className = 'page-title-section';

  section.innerHTML = `
    <div class="page-title-container">
      <h1>${title}</h1>
      <p>${subtitle}</p>
    </div>
  `;

  return section;
}
