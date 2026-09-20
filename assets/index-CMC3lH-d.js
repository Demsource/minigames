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
  `;let n=e.querySelector(`#login-btn`),r=e.querySelector(`#signup-btn`);n?.addEventListener(`click`,a),r?.addEventListener(`click`,a);let o=new i;return document.body.append(o.getElement()),e.querySelector(`.burger-toggle`)?.addEventListener(`click`,()=>o.open()),e}function s(){let e=document.createElement(`div`);return e.className=`page-container`,e.append(o()),e}function c(){let e=document.createElement(`div`);return e.className=`page-container`,e.innerHTML=`
    <h1>Library Page</h1>
    <p>Explore your game library here.</p>
    <a href="/" data-link class="nav-link">Go Home</a>
  `,e}var l=document.querySelector(`#app`);if(l){let t=new e(l,`/minigames`);t.addRoute(`/`,s),t.addRoute(`/library`,c),t.handleRoute()}