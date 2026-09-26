import './footer.scss';
import logoIcon from '../../assets/icons/logo-minigames.svg';
import shareIcon from '../../assets/icons/share.svg';
import chatIcon from '../../assets/icons/chat.svg';
import rssIcon from '../../assets/icons/rss.svg';
import rsSchoolLogo from '../../assets/rss.svg';

export function Footer(): HTMLElement {
  const footer = document.createElement('footer');
  footer.className = 'footer-section';

  footer.innerHTML = `
    <div class="footer-top">
      <div class="footer-brand">
        <div class="brand-logo">
          <img src="${logoIcon}" alt="MiniGames Logo" />
          <h2>MiniGames</h2>
        </div>
        <p>Take a short break and have fun. Hundreds of curated casual mini-games right in your web browser. No download required.</p>
      </div>

      <div class="footer-links-wrapper">
        <div class="footer-col explore">
          <h3>Explore</h3>
          <a href="/" data-link>Home</a>
          <a href="/library" data-link>Library</a>
          <a href="/" data-link>Categories</a>
          <a href="/" data-link>Tournaments</a>
        </div>
        <div class="footer-col company">
          <h3>Company</h3>
          <a href="/">About Us</a>
          <a href="/">Contact</a>
          <a href="/">Privacy Policy</a>
          <a href="/">Terms of Service</a>
        </div>
        <div class="footer-col community">
          <h3>Community</h3>
          <div class="social-icons">
            <a href="/" class="social-btn"><img src="${shareIcon}" alt="Share" /></a>
            <a href="/" class="social-btn"><img src="${chatIcon}" alt="Chat" /></a>
            <a href="/" class="social-btn"><img src="${rssIcon}" alt="RSS" /></a>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-divider"></div>
    <div class="footer-bottom">
      <div class="copyright">© 2026 MiniGames. All rights reserved.</div>
      <div class="partners">
        <a href="https://rs.school/courses/short-track" target="_blank" rel="noopener noreferrer">
          <img src="${rsSchoolLogo}" alt="RS School" /> RS School
        </a>
        <a href="https://github.com/Demsource" target="_blank" rel="noopener noreferrer">
          <span class="code-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </span>
          @Demsource
        </a>
      </div>
      <div class="designed-by">Designed with love</div>
    </div>
  `;

  return footer;
}
