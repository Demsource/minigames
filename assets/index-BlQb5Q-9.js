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
  `,setTimeout(()=>{let t=e.querySelector(`.carousel-container`);t&&(t.scrollLeft=144)},0),e}function p(){let e=document.createElement(`div`);return e.className=`page-container`,e.append(o()),e.append(s()),e.append(f()),e}function m(){let e=document.createElement(`div`);return e.className=`page-container`,e.innerHTML=`
    <h1>Library Page</h1>
    <p>Explore your game library here.</p>
    <a href="/" data-link class="nav-link">Go Home</a>
  `,e}var h=document.querySelector(`#app`);if(h){let t=new e(h,`/minigames`);t.addRoute(`/`,p),t.addRoute(`/library`,m),t.handleRoute()}