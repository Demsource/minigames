import './developer-cta.scss';
import workingStationImg from '../../assets/images/working-station.png';

export function DeveloperCta(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'developer-cta-section';

  section.innerHTML = `
    <div class="cta-image-wrapper">
      <img src="${workingStationImg}" alt="Developer working station with a game on screen" />
    </div>
    <div class="cta-card">
      <h2>Are You a Game Developer?</h2>
      <p>
        Want to see your game on MiniGames? We're always looking for fun,
        engaging mini games to add to our platform. Submit your game
        and reach thousands of players!
      </p>
      <button class="btn-submit" type="button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        Submit Form
      </button>
      <p class="contact-text">or contact us at developers@minigames.com</p>
    </div>
  `;

  return section;
}
