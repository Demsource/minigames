(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=class{routes=new Map;rootElement;base;constructor(e,t=``){this.rootElement=e,this.base=t;let n=new URLSearchParams(globalThis.location.search).get(`p`);n&&globalThis.history.replaceState({},``,this.base+n),globalThis.addEventListener(`popstate`,()=>this.handleRoute()),document.addEventListener(`click`,e=>{let t=e.target.closest(`a`);if(!t||!t.matches(`[data-link]`))return;e.preventDefault();let n=t.getAttribute(`href`);n&&this.navigateTo(n)})}addRoute(e,t){this.routes.set(e,t)}navigateTo(e){globalThis.history.pushState({},``,this.base+e),this.handleRoute()}handleRoute(){let e=globalThis.location.pathname,t=e.startsWith(this.base)?e.slice(this.base.length)||`/`:e,n=this.routes.get(t)||this.routes.get(`/404`);this.rootElement.replaceChildren(),n?this.rootElement.append(n()):this.rootElement.innerHTML=`
  <div class="page-container not-found">
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
    <a href="/" data-link class="nav-link">Go Home</a>
  </div>
`}},t=`data:image/svg+xml,%3csvg%20width='32'%20height='32'%20viewBox='0%200%2032%2032'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3cg%20clip-path='url(%23clip0_1_258)'%3e%3cpath%20d='M26%201H6C3.23858%201%201%203.23858%201%206V26C1%2028.7614%203.23858%2031%206%2031H26C28.7614%2031%2031%2028.7614%2031%2026V6C31%203.23858%2028.7614%201%2026%201Z'%20fill='url(%23pattern0_1_258)'%20stroke='%23242145'%20stroke-width='2'/%3e%3c/g%3e%3cdefs%3e%3cpattern%20id='pattern0_1_258'%20patternContentUnits='objectBoundingBox'%20width='1'%20height='1'%3e%3cuse%20xlink:href='%23image0_1_258'%20transform='scale(0.03125)'/%3e%3c/pattern%3e%3cclipPath%20id='clip0_1_258'%3e%3crect%20width='32'%20height='32'%20fill='white'/%3e%3c/clipPath%3e%3cimage%20id='image0_1_258'%20width='32'%20height='32'%20preserveAspectRatio='none'%20xlink:href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAABCNJREFUeAG1V91rXEUU/83szeazNj5YTRVJQWoEg1YqKD6of4KKL2KxD4qPPuiLltpabKlatUIefFFEQQT7KAhFSAVfRKFSQQShXbWUZrMJCdm0m9175/TM1/3YvR9J0x52mLkzc875na+ZHcAREU1yO6KI5rnRbWrnQ6KDSJFwyqcJmOfhNMqIPMe2qcFinhVCNIw4RnapUvmtR6SV76uRdcnBm5Mryhn8dP7yJE9vCB0X/ngUt4y25JVzGgBtT8b2MMjcWVEhnTGTUuh2Q9PrJtKsWwAvsSUi81OK8MHps9j/9EnMPnEcn8z9pBM5DvdWKD8EfjEWmPKpViQE9swexq5dO3mW0Gyu4eKfx7JQDUt1LEo9QBko2WGnG9k9/N3rRYM8pbGgzQHwm3u9EKFWYtxshX564gV4BB+ffD7ZrXOD96soyYvBuCTASkNgmQkX/rqMA699g4iFs1yjZGJiGEGtZmSFoUK73UEgJfjH8xJfff4yHpm9vzIngirlmu69507U6wFqtRyHkVU4uXMsmWKUU1OTsa2UsptSfHqiPATOU2NjdWNlpr6LeqZeFOGOidFYT1pnv+xyAI5jZDiwNS98dts1kTbJR5Lnuhuh8ZjZg/I6CNKAKFaqjDwpLT5ddpGiRJDKyStfdowy5L1SJmqV+87LB5nmt9p0nUu8+fYZ7H3sKO6bOYSvv/sVE+PDzgNkeo2GPPI+C3aMj+DbM79h94Pv4IF9R/DWoe8NiDzKVoEbdrnkHn/mFEZHAqNM5PGKxGg9ZkFQukdiqYQGKzgkEX45+wbGR0cs+BQFGR+6oJIWpnTMa1ZgfKWm71fbKQeQZAqM26EMC7FBG2xMPTcZZMYk19frNbx64Ek0F9Zx+f8lzH34ojmMtALhDiPh8Eple0HJUa2T8PSJ53D1ygoWFtt4/ZWnjNy8g7nwINKHjU9CTXv3H+Nat6VllPHSUusaJ2eEu+/aYYSTuSeA1dXr+Pv3d2NepW9LmVOvKClDwcpNwhGZBBoyh5CznIcPz+zGP+cP49KF9/DQzFRGrD4RtVJjiJNVVJCDAHL80dnoYWgoMO7XMpoLbXwx95IpT01f8ri1vB6fCwGHsNMJE4HWPcijQQA5ibKyeg31wGcbIRjqY2HNxmIX5HpQQ3u9k5VZcBrJEr2uKoB//1vG4lKbLV9Ds7XGNx3h+Ec/WPsY0PunfuRkgllb5P8GreU2LjZaiRwq1LCJ27AAILlw+NX+deX+uFSRzKIsIB/GuFHsHX+ymIRN7ckop2IdGsA5WCOKSRSggj8mU4DK+Ae3/CGZ9edc2aXks4pQfd8VE6fNZ8I8SgH9OJmuYkjfvv3z6FsTJd9u3JBC7OEmVvRDkecaqCDa5Foe0L4/Jg2ns28TvxP1U+02Ps/nI6Kj2ute5w08AKp+H2eCQgAAAABJRU5ErkJggg=='/%3e%3c/defs%3e%3c/svg%3e`,n=`data:image/svg+xml,%3csvg%20width='10'%20height='10'%20viewBox='0%200%2010%2010'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M1.0625%2010L0%208.9375L3.9375%205L0%201.0625L1.0625%20-1.19209e-06L5%203.9375L8.9375%20-1.19209e-06L10%201.0625L6.0625%205L10%208.9375L8.9375%2010L5%206.0625L1.0625%2010Z'%20fill='white'/%3e%3c/svg%3e`,r=e=>{e.preventDefault(),alert(`Auth dialog will be built later!`)},i=class{element;isOpen=!1;constructor(){this.element=document.createElement(`div`),this.element.className=`burger-menu-overlay`,this.element.innerHTML=`
      <div class="burger-header">
        <a href="/" class="burger-brand" data-link>
          <div class="burger-logo-icon">
            <img src="${t}" alt="Logo" />
          </div>
          <span class="burger-logo-text">MiniGames</span>
        </a>
        <button type="button" class="burger-close" aria-label="Close menu">
          <img src="${n}" alt="Close" />
        </button>
      </div>

      <nav class="burger-nav">
        <a href="/" class="nav-item active" data-link>Home</a>
        <a href="/" class="nav-item" data-link>Library</a>
        <a href="/" class="nav-item" data-link>Tournaments</a>
        <a href="/" class="nav-item" data-link>Community</a>
      </nav>

      <div class="burger-auth">
        <button type="button" class="btn-login" id="burger-login-btn">Log In</button>
        <button type="button" class="btn-signup" id="burger-signup-btn">Sign Up</button>
      </div>
    `,this.bindEvents()}bindEvents(){this.element.querySelector(`.burger-close`)?.addEventListener(`click`,()=>this.close()),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&this.isOpen&&this.close()});let e=this.element.querySelector(`#burger-login-btn`),t=this.element.querySelector(`#burger-signup-btn`);e?.addEventListener(`click`,e=>{this.close(),r(e)}),t?.addEventListener(`click`,e=>{this.close(),r(e)});let n=this.element.querySelectorAll(`.nav-item`);for(let e of n)e.addEventListener(`click`,()=>this.close())}open(){this.isOpen=!0,this.element.classList.add(`is-open`),document.body.style.overflow=`hidden`}close(){this.isOpen=!1,this.element.classList.remove(`is-open`),document.body.style.overflow=``}getElement(){return this.element}},a=e=>{e.preventDefault(),alert(`Auth dialog will be built later!`)};function o(){let e=document.createElement(`header`);e.className=`site-header`,e.innerHTML=`
    <div class="header-inner">
      <a href="/" class="header-brand" data-link>
        <div class="header-logo-icon">
          <img src="${t}" alt="Logo" />
        </div>
        <span class="header-logo-text">MiniGames</span>
      </a>
      
      <nav class="header-nav">
        <a href="/" class="nav-item active" data-link>Home</a>
        <a href="/" class="nav-item" data-link>Library</a>
        <a href="/" class="nav-item" data-link>Tournaments</a>
        <a href="/" class="nav-item" data-link>Community</a>
      </nav>

      <div class="header-auth">
        <button type="button" class="btn-login" id="login-btn">Log In</button>
        <button type="button" class="btn-signup" id="signup-btn">Sign Up</button>
        
        <button type="button" class="burger-toggle" aria-label="Open menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  `;let n=e.querySelector(`#login-btn`),r=e.querySelector(`#signup-btn`);n?.addEventListener(`click`,a),r?.addEventListener(`click`,a);let o=new i;return document.body.append(o.getElement()),e.querySelector(`.burger-toggle`)?.addEventListener(`click`,()=>o.open()),e}function s(){let e=document.createElement(`section`);return e.className=`hero-section`,e.innerHTML=`
    <div class="hero-container">
      <div class="hero-card">
        <h1>Take a Short Break<br>& Have Fun</h1>
        <p>
          <span class="desktop-text">Discover hundreds of curated casual mini-games. Play instantly in your browser — puzzle, match 3, farm, and board classics.</span>
          <span class="mobile-text">Discover hundreds of curated casual mini-games right in your browser.</span>
        </p>
        <button type="button" class="btn-browse">Browse Library</button>
      </div>
    </div>
  `,e}var c=`data:image/svg+xml,%3csvg%20width='20'%20height='19'%20viewBox='0%200%2020%2019'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M6.85%2014.825L10%2012.925L13.15%2014.85L12.325%2011.25L15.1%208.85L11.45%208.525L10%205.125L8.55%208.5L4.9%208.825L7.675%2011.25L6.85%2014.825ZM3.825%2019L5.45%2011.975L0%207.25L7.2%206.625L10%200L12.8%206.625L20%207.25L14.55%2011.975L16.175%2019L10%2015.275L3.825%2019Z'%20fill='%23FFD02B'/%3e%3c/svg%3e`,l=`data:image/svg+xml,%3csvg%20width='20'%20height='19'%20viewBox='0%200%2020%2019'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M10%2018.35L8.55%2017.05C6.86667%2015.5333%205.475%2014.225%204.375%2013.125C3.275%2012.025%202.4%2011.0417%201.75%2010.175C1.1%209.29167%200.641667%208.48333%200.375%207.75C0.125%207.01667%200%206.26667%200%205.5C0%203.93333%200.525%202.625%201.575%201.575C2.625%200.525%203.93333%200%205.5%200C6.36667%200%207.19167%200.183333%207.975%200.55C8.75833%200.916667%209.43333%201.43333%2010%202.1C10.5667%201.43333%2011.2417%200.916667%2012.025%200.55C12.8083%200.183333%2013.6333%200%2014.5%200C16.0667%200%2017.375%200.525%2018.425%201.575C19.475%202.625%2020%203.93333%2020%205.5C20%206.26667%2019.8667%207.01667%2019.6%207.75C19.35%208.48333%2018.9%209.29167%2018.25%2010.175C17.6%2011.0417%2016.725%2012.025%2015.625%2013.125C14.525%2014.225%2013.1333%2015.5333%2011.45%2017.05L10%2018.35ZM10%2015.65C11.6%2014.2167%2012.9167%2012.9917%2013.95%2011.975C14.9833%2010.9417%2015.8%2010.05%2016.4%209.3C17%208.53333%2017.4167%207.85834%2017.65%207.275C17.8833%206.675%2018%206.08333%2018%205.5C18%204.5%2017.6667%203.66667%2017%203C16.3333%202.33333%2015.5%202%2014.5%202C13.7167%202%2012.9917%202.225%2012.325%202.675C11.6583%203.10833%2011.2%203.66667%2010.95%204.35H9.05C8.8%203.66667%208.34167%203.10833%207.675%202.675C7.00833%202.225%206.28333%202%205.5%202C4.5%202%203.66667%202.33333%203%203C2.33333%203.66667%202%204.5%202%205.5C2%206.08333%202.11667%206.675%202.35%207.275C2.58333%207.85834%203%208.53333%203.6%209.3C4.2%2010.05%205.01667%2010.9417%206.05%2011.975C7.08333%2012.9917%208.4%2014.2167%2010%2015.65Z'%20fill='%23FF4B4B'/%3e%3c/svg%3e`,u=[{title:`Candy Crush`,image:`/minigames/assets/Game%20Card%20-%20Candy%20Crush-BFyEbBZ6.png`,rating:`4.6`,likes:`89.0K`},{title:`ISLANDERS: New Shores`,image:`/minigames/assets/Game%20Card%20-%20Islanders%20New%20Shores-DDuAg2Gr.png`,rating:`4.9`,likes:`54.2K`},{title:`Vacation Cafe Simulator`,image:`/minigames/assets/Game%20Card%20-%20Vacation%20Cafe%20Simulator-KK_EFf11.png`,rating:`4.8`,likes:`28.7K`},{title:`Winter Burrow`,image:`/minigames/assets/Game%20Card%20-%20Winter%20Burrow-CGq3U16Y.png`,rating:`4.9`,likes:`32.4K`},{title:`Bubble Shooter`,image:`/minigames/assets/Game%20Card%20-%20Bubble%20Shooter-CbJ-ddeT.png`,rating:`4.7`,likes:`12.1K`}];function d(e,t){return`
    <div class="game-card${t===2?` game-card-wide`:``}">
      <img src="${e.image}" alt="${e.title}" class="game-image" />
      <div class="game-info-overlay">
        <h3 class="game-title" title="${e.title}">${e.title}</h3>
        <div class="game-stats">
          <div class="stat-item rating">
            <img src="${c}" alt="Star" />
            <span>${e.rating}</span>
          </div>
          <div class="stat-item likes">
            <img src="${l}" alt="Heart" />
            <span>${e.likes}</span>
          </div>
        </div>
      </div>
    </div>
  `}function f(){let e=document.createElement(`section`);return e.className=`new-games-section`,e.innerHTML=`
    <header class="section-header">
      <div class="header-title-wrapper">
        <div class="title-accent"></div>
        <h2>New Games</h2>
      </div>
      <div class="header-nav-buttons">
        <button type="button" class="btn-prev" aria-label="Previous">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <button type="button" class="btn-next" aria-label="Next">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </header>
    <div class="carousel-container">
      ${u.map((e,t)=>d(e,t)).join(``)}
    </div>
  `,setTimeout(()=>{let t=e.querySelector(`.carousel-container`);t&&(t.scrollLeft=144)},0),e}var p={data:[{rank:1,playerName:`Alex_Pro99`,gamesPlayed:142,totalScore:94250,streakDays:12,favoriteGameSlug:`heartopia`,favoriteGameName:`Heartopia`},{rank:2,playerName:`CozyGamer_x`,gamesPlayed:118,totalScore:81400,streakDays:8,favoriteGameSlug:`cat-mail-co`,favoriteGameName:`Cat Mail Co.`},{rank:3,playerName:`MatchMaster`,gamesPlayed:98,totalScore:72110,streakDays:5,favoriteGameSlug:`tiny-glade`,favoriteGameName:`Tiny Glade`},{rank:4,playerName:`BubblePop`,gamesPlayed:87,totalScore:65900,streakDays:3,favoriteGameSlug:`whisper-of-the-house`,favoriteGameName:`Whisper of the House`},{rank:5,playerName:`SudokuGod`,gamesPlayed:74,totalScore:59320,streakDays:2,favoriteGameSlug:`cat-chess`,favoriteGameName:`Cat Chess`}],meta:{totalItems:5,description:`Top Players This Week`}};function m(e){return e.toLocaleString(`en-US`)}function h(e){return(e/1e3).toFixed(1)+`K`}function g(e){let t=e.match(/[A-Z]/g);return t&&t.length>=2?t[0]+t[1]:e.slice(0,2).toUpperCase()}function _(){let e=document.createElement(`section`);return e.className=`leaderboard-section`,e.innerHTML=`
    <header class="section-header">
      <div class="title-accent"></div>
      <h2>
        <span class="desktop-title">Top Players This Week</span>
        <span class="mobile-title">Top Players</span>
      </h2>
    </header>
    <div class="leaderboard-table-container">
      <div class="lb-row lb-header">
        <div class="lb-cell">RANK</div>
        <div class="lb-cell">PLAYER</div>
        <div class="lb-cell col-games">
          <span class="desktop-val">GAMES PLAYED</span>
          <span class="tablet-val">GAMES</span>
          <span class="mobile-val">GAMES</span>
        </div>
        <div class="lb-cell">
          <span class="desktop-val">TOTAL SCORE</span>
          <span class="tablet-val">SCORE</span>
          <span class="mobile-val">SCORE</span>
        </div>
        <div class="lb-cell">STREAK</div>
        <div class="lb-cell col-favorite">FAVORITE GAME</div>
      </div>
      ${p.data.map(e=>`
    <div class="lb-row lb-data rank-${e.rank}">
      <div class="lb-cell cell-rank ${e.rank===1?`top-1`:``} ${e.rank===2?`top-2`:``} ${e.rank===3?`top-3`:``}">
        <span class="desktop-val">#${e.rank}</span>
        <span class="tablet-val">#${e.rank}</span>
        <span class="mobile-val">#${e.rank}</span>
      </div>
      <div class="lb-cell cell-player">
        <div class="player-avatar bg-${e.rank}">${g(e.playerName)}</div>
        <span class="player-name">${e.playerName}</span>
      </div>
      <div class="lb-cell col-games">${e.gamesPlayed}</div>
      <div class="lb-cell cell-score">
        <span class="desktop-val">${m(e.totalScore)}</span>
        <span class="tablet-val">${m(e.totalScore)}</span>
        <span class="mobile-val">${h(e.totalScore)}</span>
      </div>
      <div class="lb-cell cell-streak">
        🔥 <span class="desktop-val">${e.streakDays} days</span>
        <span class="tablet-val">${e.streakDays}d</span>
        <span class="mobile-val">${e.streakDays}d</span>
      </div>
      <div class="lb-cell col-favorite cell-favorite">
        <span class="pill">${e.favoriteGameName}</span>
      </div>
    </div>
  `).join(``)}
    </div>
  `,e}var v=`/minigames/assets/working-station-CM8ozyRC.png`;function y(){let e=document.createElement(`section`);return e.className=`developer-cta-section`,e.innerHTML=`
    <div class="cta-image-wrapper">
      <img src="${v}" alt="Developer working station with a game on screen" />
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
  `,e}var b=`data:image/svg+xml,%3csvg%20width='40'%20height='40'%20viewBox='0%200%2040%2040'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M0%2020C0%208.95431%208.95431%200%2020%200V0C31.0457%200%2040%208.95431%2040%2020V20C40%2031.0457%2031.0457%2040%2020%2040V40C8.95431%2040%200%2031.0457%200%2020V20Z'%20fill='%232A264F'/%3e%3cpath%20d='M23.5%2028C22.8056%2028%2022.2153%2027.7569%2021.7292%2027.2708C21.2431%2026.7847%2021%2026.1944%2021%2025.5C21%2025.375%2021.0278%2025.1736%2021.0833%2024.8958L16.1458%2021.875C15.9236%2022.0694%2015.6736%2022.2222%2015.3958%2022.3333C15.1181%2022.4444%2014.8194%2022.5%2014.5%2022.5C13.8056%2022.5%2013.2153%2022.2569%2012.7292%2021.7708C12.2431%2021.2847%2012%2020.6944%2012%2020C12%2019.3056%2012.2431%2018.7153%2012.7292%2018.2292C13.2153%2017.7431%2013.8056%2017.5%2014.5%2017.5C14.8194%2017.5%2015.1181%2017.5556%2015.3958%2017.6667C15.6736%2017.7778%2015.9236%2017.9306%2016.1458%2018.125L21.0833%2015.1042C21.0556%2015.0069%2021.0347%2014.9097%2021.0208%2014.8125C21.0069%2014.7153%2021%2014.6111%2021%2014.5C21%2013.8056%2021.2431%2013.2153%2021.7292%2012.7292C22.2153%2012.2431%2022.8056%2012%2023.5%2012C24.1944%2012%2024.7847%2012.2431%2025.2708%2012.7292C25.7569%2013.2153%2026%2013.8056%2026%2014.5C26%2015.1944%2025.7569%2015.7847%2025.2708%2016.2708C24.7847%2016.7569%2024.1944%2017%2023.5%2017C23.1806%2017%2022.8819%2016.9444%2022.6042%2016.8333C22.3264%2016.7222%2022.0764%2016.5694%2021.8542%2016.375L16.9167%2019.3958C16.9444%2019.4931%2016.9653%2019.5903%2016.9792%2019.6875C16.9931%2019.7847%2017%2019.8889%2017%2020C17%2020.1111%2016.9931%2020.2153%2016.9792%2020.3125C16.9653%2020.4097%2016.9444%2020.5069%2016.9167%2020.6042L21.8542%2023.625C22.0764%2023.4306%2022.3264%2023.2778%2022.6042%2023.1667C22.8819%2023.0556%2023.1806%2023%2023.5%2023C24.1944%2023%2024.7847%2023.2431%2025.2708%2023.7292C25.7569%2024.2153%2026%2024.8056%2026%2025.5C26%2026.1944%2025.7569%2026.7847%2025.2708%2027.2708C24.7847%2027.7569%2024.1944%2028%2023.5%2028ZM23.5%2026.5C23.7778%2026.5%2024.0139%2026.4028%2024.2083%2026.2083C24.4028%2026.0139%2024.5%2025.7778%2024.5%2025.5C24.5%2025.2222%2024.4028%2024.9861%2024.2083%2024.7917C24.0139%2024.5972%2023.7778%2024.5%2023.5%2024.5C23.2222%2024.5%2022.9861%2024.5972%2022.7917%2024.7917C22.5972%2024.9861%2022.5%2025.2222%2022.5%2025.5C22.5%2025.7778%2022.5972%2026.0139%2022.7917%2026.2083C22.9861%2026.4028%2023.2222%2026.5%2023.5%2026.5ZM14.5%2021C14.7778%2021%2015.0139%2020.9028%2015.2083%2020.7083C15.4028%2020.5139%2015.5%2020.2778%2015.5%2020C15.5%2019.7222%2015.4028%2019.4861%2015.2083%2019.2917C15.0139%2019.0972%2014.7778%2019%2014.5%2019C14.2222%2019%2013.9861%2019.0972%2013.7917%2019.2917C13.5972%2019.4861%2013.5%2019.7222%2013.5%2020C13.5%2020.2778%2013.5972%2020.5139%2013.7917%2020.7083C13.9861%2020.9028%2014.2222%2021%2014.5%2021ZM23.5%2015.5C23.7778%2015.5%2024.0139%2015.4028%2024.2083%2015.2083C24.4028%2015.0139%2024.5%2014.7778%2024.5%2014.5C24.5%2014.2222%2024.4028%2013.9861%2024.2083%2013.7917C24.0139%2013.5972%2023.7778%2013.5%2023.5%2013.5C23.2222%2013.5%2022.9861%2013.5972%2022.7917%2013.7917C22.5972%2013.9861%2022.5%2014.2222%2022.5%2014.5C22.5%2014.7778%2022.5972%2015.0139%2022.7917%2015.2083C22.9861%2015.4028%2023.2222%2015.5%2023.5%2015.5Z'%20fill='white'/%3e%3c/svg%3e`,x=`data:image/svg+xml,%3csvg%20width='40'%20height='40'%20viewBox='0%200%2040%2040'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M0%2020C0%208.95431%208.95431%200%2020%200V0C31.0457%200%2040%208.95431%2040%2020V20C40%2031.0457%2031.0457%2040%2020%2040V40C8.95431%2040%200%2031.0457%200%2020V20Z'%20fill='%232A264F'/%3e%3cpath%20d='M15%2022H22V20.5H15V22ZM15%2019.25H25V17.75H15V19.25ZM15%2016.5H25V15H15V16.5ZM12%2028V13.5C12%2013.0833%2012.1458%2012.7292%2012.4375%2012.4375C12.7292%2012.1458%2013.0833%2012%2013.5%2012H26.5C26.9167%2012%2027.2708%2012.1458%2027.5625%2012.4375C27.8542%2012.7292%2028%2013.0833%2028%2013.5V23.5C28%2023.9167%2027.8542%2024.2708%2027.5625%2024.5625C27.2708%2024.8542%2026.9167%2025%2026.5%2025H15L12%2028ZM14.375%2023.5H26.5V13.5H13.5V24.375L14.375%2023.5ZM13.5%2023.5V13.5V23.5Z'%20fill='white'/%3e%3c/svg%3e`,S=`data:image/svg+xml,%3csvg%20width='40'%20height='40'%20viewBox='0%200%2040%2040'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M0%2020C0%208.95431%208.95431%200%2020%200V0C31.0457%200%2040%208.95431%2040%2020V20C40%2031.0457%2031.0457%2040%2020%2040V40C8.95431%2040%200%2031.0457%200%2020V20Z'%20fill='%232A264F'/%3e%3cpath%20d='M14.5%2027C14.0833%2027%2013.7292%2026.8542%2013.4375%2026.5625C13.1458%2026.2708%2013%2025.9167%2013%2025.5C13%2025.0833%2013.1458%2024.7292%2013.4375%2024.4375C13.7292%2024.1458%2014.0833%2024%2014.5%2024C14.9167%2024%2015.2708%2024.1458%2015.5625%2024.4375C15.8542%2024.7292%2016%2025.0833%2016%2025.5C16%2025.9167%2015.8542%2026.2708%2015.5625%2026.5625C15.2708%2026.8542%2014.9167%2027%2014.5%2027ZM25%2027C25%2025.3333%2024.6806%2023.7778%2024.0417%2022.3333C23.4167%2020.875%2022.5625%2019.6042%2021.4792%2018.5208C20.3958%2017.4375%2019.125%2016.5833%2017.6667%2015.9583C16.2222%2015.3194%2014.6667%2015%2013%2015V13C14.9444%2013%2016.7569%2013.3681%2018.4375%2014.1042C20.1319%2014.8264%2021.6181%2015.8264%2022.8958%2017.1042C24.1736%2018.3819%2025.1736%2019.8681%2025.8958%2021.5625C26.6319%2023.2431%2027%2025.0556%2027%2027H25ZM20%2027C20%2026.0278%2019.8194%2025.1181%2019.4583%2024.2708C19.0972%2023.4236%2018.5972%2022.6806%2017.9583%2022.0417C17.3194%2021.4028%2016.5764%2020.9028%2015.7292%2020.5417C14.8819%2020.1806%2013.9722%2020%2013%2020V18C14.2639%2018%2015.4375%2018.2361%2016.5208%2018.7083C17.6042%2019.1667%2018.5556%2019.8056%2019.375%2020.625C20.1944%2021.4444%2020.8333%2022.3958%2021.2917%2023.4792C21.7639%2024.5625%2022%2025.7361%2022%2027H20Z'%20fill='white'/%3e%3c/svg%3e`,C=`data:image/svg+xml,%3csvg%20viewBox='0%200%2064%2064'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_5701_38384)'%3e%3ccircle%20cx='32'%20cy='32'%20r='32'%20fill='black'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M13%2021.5095V42.5L19.3067%2042.4621V33.9474C20.0567%2033.9474%2020.7616%2033.9775%2021.4049%2034.4267C21.8946%2034.8785%2022.2838%2035.4335%2022.546%2036.054L25.9202%2042.4621H33C31.5957%2039.6675%2030.4706%2036.1327%2028.0552%2034.0104C27.5455%2033.6749%2026.9919%2033.4158%2026.411%2033.241C27.1873%2033.0779%2027.9357%2032.7973%2028.6319%2032.4084C30.3855%2031.3375%2031.3915%2029.3808%2031.3436%2027.3374C31.3798%2026.1328%2031.0495%2024.9466%2030.3988%2023.9441C28.9256%2021.6883%2025.9337%2021.4213%2023.4663%2021.5095H13ZM21.9939%2030.0116H19.3313V25.6975H22.1043C23.4807%2025.5594%2025.1814%2026.1754%2025.0859%2027.8041C25.1499%2029.5621%2023.3647%2029.9127%2021.9939%2030.0116Z'%20fill='%23FFB749'/%3e%3cpath%20d='M39.4768%2035.089L33%2035.4666C33.1262%2037.3671%2034.0021%2039.16%2035.4636%2040.5088C36.9117%2041.8323%2039.5076%2042.4941%2043.2515%2042.4941C46.3564%2042.5823%2049.9058%2041.8146%2051.821%2039.1569C52.5929%2038.0934%2053.0033%2036.8427%2052.9998%2035.564C53.0217%2033.1848%2051.4339%2031.2297%2049.3044%2030.3147C47.2632%2029.4766%2045.1198%2028.8674%2042.9204%2028.5C42.1107%2028.41%2041.3327%2028.1563%2040.6423%2027.757C39.9039%2027.2597%2040.078%2026.2272%2040.735%2025.7596C42.6084%2024.5207%2045.6299%2025.5545%2045.8608%2027.9032L52.2845%2027.5621C52.1703%2025.768%2051.1844%2024.0545%2049.6356%2022.9583C47.6987%2021.8887%2045.4532%2021.3874%2043.1986%2021.5212C41.3493%2021.4527%2039.5037%2021.7218%2037.7682%2022.3128C35.6082%2023.1125%2033.829%2025.064%2033.8344%2027.4525C33.7931%2028.9377%2034.5158%2030.4088%2035.755%2031.3621C37.6454%2032.6238%2039.8325%2033.4582%2042.139%2033.798C43.3833%2033.9637%2044.5727%2034.3795%2045.6224%2035.0159C46.5878%2035.7309%2046.5807%2037.167%2045.5959%2037.8903C44.5078%2038.6532%2042.9034%2038.7416%2041.6818%2038.2468C40.3717%2037.716%2039.6048%2036.4784%2039.4768%2035.089Z'%20fill='%23FFB749'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_5701_38384'%3e%3crect%20width='64'%20height='64'%20fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e`;function w(){let e=document.createElement(`footer`);return e.className=`footer-section`,e.innerHTML=`
    <div class="footer-top">
      <div class="footer-brand">
        <div class="brand-logo">
          <img src="${t}" alt="MiniGames Logo" />
          <h2>MiniGames</h2>
        </div>
        <p>Take a short break and have fun. Hundreds of curated casual mini-games right in your web browser. No download required.</p>
      </div>

      <div class="footer-links-wrapper">
        <div class="footer-col explore">
          <h3>Explore</h3>
          <a href="/">Home</a>
          <a href="/">Library</a>
          <a href="/">Categories</a>
          <a href="/">Tournaments</a>
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
            <a href="/" class="social-btn"><img src="${b}" alt="Share" /></a>
            <a href="/" class="social-btn"><img src="${x}" alt="Chat" /></a>
            <a href="/" class="social-btn"><img src="${S}" alt="RSS" /></a>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-divider"></div>
    <div class="footer-bottom">
      <div class="copyright">© 2026 MiniGames. All rights reserved.</div>
      <div class="partners">
        <a href="https://rs.school/courses/short-track" target="_blank" rel="noopener noreferrer">
          <img src="${C}" alt="RS School" /> RS School
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
  `,e}function T(){let e=document.createElement(`div`);return e.className=`page-container`,e.append(o()),e.append(s()),e.append(f()),e.append(_()),e.append(y()),e.append(w()),e}function E(){let e=document.createElement(`div`);return e.className=`page-container`,e.innerHTML=`
    <h1>Library Page</h1>
    <p>Explore your game library here.</p>
    <a href="/" data-link class="nav-link">Go Home</a>
  `,e}var D=document.querySelector(`#app`);if(D){let t=new e(D,`/minigames`);t.addRoute(`/`,T),t.addRoute(`/library`,E),t.handleRoute()}