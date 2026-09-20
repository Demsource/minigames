(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=class{routes=new Map;rootElement;base;constructor(e,t=``){this.rootElement=e,this.base=t;let n=new URLSearchParams(globalThis.location.search).get(`p`);n&&globalThis.history.replaceState({},``,this.base+n),globalThis.addEventListener(`popstate`,()=>this.handleRoute()),document.addEventListener(`click`,e=>{let t=e.target.closest(`a`);if(!t||!t.matches(`[data-link]`))return;e.preventDefault();let n=t.getAttribute(`href`);n&&this.navigateTo(n)})}addRoute(e,t){this.routes.set(e,t)}navigateTo(e){globalThis.history.pushState({},``,this.base+e),this.handleRoute()}handleRoute(){let e=globalThis.location.pathname,t=e.startsWith(this.base)?e.slice(this.base.length)||`/`:e,n=this.routes.get(t)||this.routes.get(`/404`);this.rootElement.replaceChildren(),n?this.rootElement.append(n()):this.rootElement.innerHTML=`
  <div class="page-container not-found">
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
    <a href="/" data-link class="nav-link">Go Home</a>
  </div>
`}};function t(){let e=document.createElement(`div`);return e.className=`page-container`,e.innerHTML=`
    <h1>Home Page</h1>
    <p>Welcome to the minigames app!</p>
    <a href="/library" data-link class="nav-link">Go to Library</a>
  `,e}function n(){let e=document.createElement(`div`);return e.className=`page-container`,e.innerHTML=`
    <h1>Library Page</h1>
    <p>Explore your game library here.</p>
    <a href="/" data-link class="nav-link">Go Home</a>
  `,e}var r=document.querySelector(`#app`);if(r){let i=new e(r,`/minigames`);i.addRoute(`/`,t),i.addRoute(`/library`,n),i.handleRoute()}