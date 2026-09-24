(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=class{routes=new Map;rootElement;base;constructor(e,t=``){this.rootElement=e,this.base=t;let n=new URLSearchParams(globalThis.location.search).get(`p`);n&&globalThis.history.replaceState({},``,this.base+n),globalThis.addEventListener(`popstate`,()=>this.handleRoute()),document.addEventListener(`click`,e=>{let t=e.target.closest(`a`);if(!t||!t.matches(`[data-link]`))return;e.preventDefault();let n=t.getAttribute(`href`);n&&this.navigateTo(n)})}addRoute(e,t){this.routes.set(e,t)}navigateTo(e){globalThis.history.pushState({},``,this.base+e),this.handleRoute()}handleRoute(){let e=globalThis.location.pathname,t=e.startsWith(this.base)?e.slice(this.base.length)||`/`:e,n=this.routes.get(t)||this.routes.get(`/404`);this.rootElement.replaceChildren(),n?this.rootElement.append(n(t)):this.rootElement.innerHTML=`
  <div class="page-container not-found">
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
    <a href="/" data-link class="nav-link">Go Home</a>
  </div>
`}},t=`data:image/svg+xml,%3csvg%20width='32'%20height='32'%20viewBox='0%200%2032%2032'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3cg%20clip-path='url(%23clip0_1_258)'%3e%3cpath%20d='M26%201H6C3.23858%201%201%203.23858%201%206V26C1%2028.7614%203.23858%2031%206%2031H26C28.7614%2031%2031%2028.7614%2031%2026V6C31%203.23858%2028.7614%201%2026%201Z'%20fill='url(%23pattern0_1_258)'%20stroke='%23242145'%20stroke-width='2'/%3e%3c/g%3e%3cdefs%3e%3cpattern%20id='pattern0_1_258'%20patternContentUnits='objectBoundingBox'%20width='1'%20height='1'%3e%3cuse%20xlink:href='%23image0_1_258'%20transform='scale(0.03125)'/%3e%3c/pattern%3e%3cclipPath%20id='clip0_1_258'%3e%3crect%20width='32'%20height='32'%20fill='white'/%3e%3c/clipPath%3e%3cimage%20id='image0_1_258'%20width='32'%20height='32'%20preserveAspectRatio='none'%20xlink:href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAABCNJREFUeAG1V91rXEUU/83szeazNj5YTRVJQWoEg1YqKD6of4KKL2KxD4qPPuiLltpabKlatUIefFFEQQT7KAhFSAVfRKFSQQShXbWUZrMJCdm0m9175/TM1/3YvR9J0x52mLkzc875na+ZHcAREU1yO6KI5rnRbWrnQ6KDSJFwyqcJmOfhNMqIPMe2qcFinhVCNIw4RnapUvmtR6SV76uRdcnBm5Mryhn8dP7yJE9vCB0X/ngUt4y25JVzGgBtT8b2MMjcWVEhnTGTUuh2Q9PrJtKsWwAvsSUi81OK8MHps9j/9EnMPnEcn8z9pBM5DvdWKD8EfjEWmPKpViQE9swexq5dO3mW0Gyu4eKfx7JQDUt1LEo9QBko2WGnG9k9/N3rRYM8pbGgzQHwm3u9EKFWYtxshX564gV4BB+ffD7ZrXOD96soyYvBuCTASkNgmQkX/rqMA699g4iFs1yjZGJiGEGtZmSFoUK73UEgJfjH8xJfff4yHpm9vzIngirlmu69507U6wFqtRyHkVU4uXMsmWKUU1OTsa2UsptSfHqiPATOU2NjdWNlpr6LeqZeFOGOidFYT1pnv+xyAI5jZDiwNS98dts1kTbJR5Lnuhuh8ZjZg/I6CNKAKFaqjDwpLT5ddpGiRJDKyStfdowy5L1SJmqV+87LB5nmt9p0nUu8+fYZ7H3sKO6bOYSvv/sVE+PDzgNkeo2GPPI+C3aMj+DbM79h94Pv4IF9R/DWoe8NiDzKVoEbdrnkHn/mFEZHAqNM5PGKxGg9ZkFQukdiqYQGKzgkEX45+wbGR0cs+BQFGR+6oJIWpnTMa1ZgfKWm71fbKQeQZAqM26EMC7FBG2xMPTcZZMYk19frNbx64Ek0F9Zx+f8lzH34ojmMtALhDiPh8Eple0HJUa2T8PSJ53D1ygoWFtt4/ZWnjNy8g7nwINKHjU9CTXv3H+Nat6VllPHSUusaJ2eEu+/aYYSTuSeA1dXr+Pv3d2NepW9LmVOvKClDwcpNwhGZBBoyh5CznIcPz+zGP+cP49KF9/DQzFRGrD4RtVJjiJNVVJCDAHL80dnoYWgoMO7XMpoLbXwx95IpT01f8ri1vB6fCwGHsNMJE4HWPcijQQA5ibKyeg31wGcbIRjqY2HNxmIX5HpQQ3u9k5VZcBrJEr2uKoB//1vG4lKbLV9Ds7XGNx3h+Ec/WPsY0PunfuRkgllb5P8GreU2LjZaiRwq1LCJ27AAILlw+NX+deX+uFSRzKIsIB/GuFHsHX+ymIRN7ckop2IdGsA5WCOKSRSggj8mU4DK+Ae3/CGZ9edc2aXks4pQfd8VE6fNZ8I8SgH9OJmuYkjfvv3z6FsTJd9u3JBC7OEmVvRDkecaqCDa5Foe0L4/Jg2ns28TvxP1U+02Ps/nI6Kj2ute5w08AKp+H2eCQgAAAABJRU5ErkJggg=='/%3e%3c/defs%3e%3c/svg%3e`,n=`data:image/svg+xml,%3csvg%20width='10'%20height='10'%20viewBox='0%200%2010%2010'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M1.0625%2010L0%208.9375L3.9375%205L0%201.0625L1.0625%20-1.19209e-06L5%203.9375L8.9375%20-1.19209e-06L10%201.0625L6.0625%205L10%208.9375L8.9375%2010L5%206.0625L1.0625%2010Z'%20fill='white'/%3e%3c/svg%3e`,r=`data:image/svg+xml,%3csvg%20width='24'%20height='24'%20viewBox='0%200%2024%2024'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M24%2012.2727C24%2011.4218%2023.9221%2010.6036%2023.7774%209.81818H12.2449V14.4655H18.8349C18.5455%2015.96%2017.6772%2017.2255%2016.3748%2018.0764V21.0982H20.3488C22.6642%2019.0036%2024%2015.9273%2024%2012.2727Z'%20fill='%234285F4'/%3e%3cpath%20d='M12.2449%2024C15.551%2024%2018.3228%2022.9309%2020.3488%2021.0982L16.3748%2018.0764C15.2839%2018.7964%2013.8924%2019.2327%2012.2449%2019.2327C9.06123%2019.2327%206.35622%2017.1273%205.38776%2014.2909H1.31354V17.3891C3.32839%2021.3055%207.45826%2024%2012.2449%2024Z'%20fill='%2334A853'/%3e%3cpath%20d='M5.38776%2014.28C5.14286%2013.56%204.99814%2012.7964%204.99814%2012C4.99814%2011.2036%205.14286%2010.44%205.38776%209.72V6.62182H1.31354C0.478664%208.23636%200%2010.0582%200%2012C0%2013.9418%200.478664%2015.7636%201.31354%2017.3782L4.48609%2014.9564L5.38776%2014.28Z'%20fill='%23FBBC05'/%3e%3cpath%20d='M12.2449%204.77818C14.0482%204.77818%2015.6512%205.38909%2016.9314%206.56727L20.4379%203.13091C18.3117%201.18909%2015.551%200%2012.2449%200C7.45826%200%203.32839%202.69455%201.31354%206.62182L5.38776%209.72C6.35622%206.88364%209.06123%204.77818%2012.2449%204.77818Z'%20fill='%23EA4335'/%3e%3c/svg%3e`,i=`data:image/svg+xml,%3csvg%20width='12'%20height='17'%20viewBox='0%200%2012%2017'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M1.5%2017C1.08333%2017%200.729167%2016.8542%200.4375%2016.5625C0.145834%2016.2708%203.57628e-07%2015.9167%203.57628e-07%2015.5V7.5C3.57628e-07%207.08333%200.145834%206.72917%200.4375%206.4375C0.729167%206.14583%201.08333%206%201.5%206H2V4C2%202.88889%202.38889%201.94444%203.16667%201.16667C3.94444%200.388888%204.88889%20-9.53674e-07%206%20-9.53674e-07C7.11111%20-9.53674e-07%208.05556%200.388888%208.83333%201.16667C9.61111%201.94444%2010%202.88889%2010%204V6H10.5C10.9167%206%2011.2708%206.14583%2011.5625%206.4375C11.8542%206.72917%2012%207.08333%2012%207.5V15.5C12%2015.9167%2011.8542%2016.2708%2011.5625%2016.5625C11.2708%2016.8542%2010.9167%2017%2010.5%2017H1.5ZM1.5%2015.5H10.5V7.5H1.5V15.5ZM6%2013C6.41667%2013%206.77083%2012.8542%207.0625%2012.5625C7.35417%2012.2708%207.5%2011.9167%207.5%2011.5C7.5%2011.0833%207.35417%2010.7292%207.0625%2010.4375C6.77083%2010.1458%206.41667%2010%206%2010C5.58333%2010%205.22917%2010.1458%204.9375%2010.4375C4.64583%2010.7292%204.5%2011.0833%204.5%2011.5C4.5%2011.9167%204.64583%2012.2708%204.9375%2012.5625C5.22917%2012.8542%205.58333%2013%206%2013ZM3.5%206H8.5V4C8.5%203.30555%208.25695%202.71528%207.77083%202.22917C7.28472%201.74305%206.69444%201.5%206%201.5C5.30556%201.5%204.71528%201.74305%204.22917%202.22917C3.74306%202.71528%203.5%203.30555%203.5%204V6ZM1.5%2015.5V7.5V15.5Z'%20fill='%235F5D75'/%3e%3c/svg%3e`,a=`data:image/svg+xml,%3csvg%20width='16'%20height='12'%20viewBox='0%200%2016%2012'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M1.5%2012C1.08333%2012%200.729167%2011.8542%200.4375%2011.5625C0.145833%2011.2708%201.78814e-07%2010.9167%201.78814e-07%2010.5V1.5C1.78814e-07%201.08333%200.145833%200.729166%200.4375%200.437499C0.729167%200.145832%201.08333%20-1.43051e-06%201.5%20-1.43051e-06H14.5C14.9167%20-1.43051e-06%2015.2708%200.145832%2015.5625%200.437499C15.8542%200.729166%2016%201.08333%2016%201.5V10.5C16%2010.9167%2015.8542%2011.2708%2015.5625%2011.5625C15.2708%2011.8542%2014.9167%2012%2014.5%2012H1.5ZM8%207L1.5%203.27083V10.5H14.5V3.27083L8%207ZM8%205.22917L14.5%201.5H1.5L8%205.22917ZM1.5%203.27083V1.5V3.27083V10.5V3.27083Z'%20fill='%235F5D75'/%3e%3c/svg%3e`,o=`data:image/svg+xml,%3csvg%20width='12'%20height='12'%20viewBox='0%200%2012%2012'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M6%206C5.16667%206%204.45833%205.70833%203.875%205.125C3.29167%204.54167%203%203.83333%203%203C3%202.16667%203.29167%201.45833%203.875%200.875C4.45833%200.291666%205.16667%20-1.43051e-06%206%20-1.43051e-06C6.83333%20-1.43051e-06%207.54167%200.291666%208.125%200.875C8.70833%201.45833%209%202.16667%209%203C9%203.83333%208.70833%204.54167%208.125%205.125C7.54167%205.70833%206.83333%206%206%206ZM3.57628e-07%2012V10C3.57628e-07%209.68056%200.0833336%209.38194%200.25%209.10417C0.430556%208.8125%200.673611%208.56944%200.979167%208.375C1.74306%207.93056%202.54861%207.59028%203.39583%207.35417C4.25694%207.11806%205.125%207%206%207C6.875%207%207.73611%207.11806%208.58333%207.35417C9.44445%207.59028%2010.2569%207.93056%2011.0208%208.375C11.3264%208.55556%2011.5625%208.79167%2011.7292%209.08333C11.9097%209.375%2012%209.68056%2012%2010V12H3.57628e-07ZM1.5%2010.5H10.5V10C10.5%209.93056%2010.4792%209.86806%2010.4375%209.8125C10.3958%209.74306%2010.3403%209.69444%2010.2708%209.66667C9.63195%209.27778%208.95139%208.98611%208.22917%208.79167C7.50694%208.59722%206.76389%208.5%206%208.5C5.23611%208.5%204.49306%208.59722%203.77083%208.79167C3.04861%208.98611%202.36806%209.27778%201.72917%209.66667C1.65972%209.72222%201.60417%209.77778%201.5625%209.83333C1.52083%209.875%201.5%209.93056%201.5%2010V10.5ZM6%204.5C6.41667%204.5%206.77083%204.35417%207.0625%204.0625C7.35417%203.77083%207.5%203.41667%207.5%203C7.5%202.58333%207.35417%202.22917%207.0625%201.9375C6.77083%201.64583%206.41667%201.5%206%201.5C5.58333%201.5%205.22917%201.64583%204.9375%201.9375C4.64583%202.22917%204.5%202.58333%204.5%203C4.5%203.41667%204.64583%203.77083%204.9375%204.0625C5.22917%204.35417%205.58333%204.5%206%204.5Z'%20fill='%235F5D75'/%3e%3c/svg%3e`,s=`data:image/svg+xml,%3csvg%20width='18'%20height='12'%20viewBox='0%200%2018%2012'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M9%209.5C9.97222%209.5%2010.7986%209.15972%2011.4792%208.47917C12.1597%207.79861%2012.5%206.97222%2012.5%206C12.5%205.02778%2012.1597%204.20139%2011.4792%203.52083C10.7986%202.84028%209.97222%202.5%209%202.5C8.02778%202.5%207.20139%202.84028%206.52083%203.52083C5.84028%204.20139%205.5%205.02778%205.5%206C5.5%206.97222%205.84028%207.79861%206.52083%208.47917C7.20139%209.15972%208.02778%209.5%209%209.5ZM9%208C8.44444%208%207.97222%207.80556%207.58333%207.41667C7.19444%207.02778%207%206.55556%207%206C7%205.44444%207.19444%204.97222%207.58333%204.58333C7.97222%204.19444%208.44444%204%209%204C9.55556%204%2010.0278%204.19444%2010.4167%204.58333C10.8056%204.97222%2011%205.44444%2011%206C11%206.55556%2010.8056%207.02778%2010.4167%207.41667C10.0278%207.80556%209.55556%208%209%208ZM9%2012C7.01389%2012%205.20833%2011.4583%203.58333%2010.375C1.95833%209.27778%200.763889%207.81944%208.9407e-08%206C0.763889%204.18056%201.95833%202.72917%203.58333%201.64583C5.20833%200.54861%207.01389%20-1.43051e-06%209%20-1.43051e-06C10.9861%20-1.43051e-06%2012.7917%200.54861%2014.4167%201.64583C16.0417%202.72917%2017.2361%204.18056%2018%206C17.2361%207.81944%2016.0417%209.27778%2014.4167%2010.375C12.7917%2011.4583%2010.9861%2012%209%2012ZM9%2010.5C10.5556%2010.5%2011.9931%2010.0972%2013.3125%209.29167C14.6319%208.48611%2015.6458%207.38889%2016.3542%206C15.6458%204.61111%2014.6319%203.51389%2013.3125%202.70833C11.9931%201.90278%2010.5556%201.5%209%201.5C7.44444%201.5%206.00694%201.90278%204.6875%202.70833C3.36806%203.51389%202.35417%204.61111%201.64583%206C2.35417%207.38889%203.36806%208.48611%204.6875%209.29167C6.00694%2010.0972%207.44444%2010.5%209%2010.5Z'%20fill='%235F5D75'/%3e%3c/svg%3e`,c=new class{backdrop;dialog;constructor(){this.createDOM(),this.attachEvents()}createDOM(){this.backdrop=document.createElement(`div`),this.backdrop.className=`auth-dialog-backdrop`,this.dialog=document.createElement(`div`),this.dialog.className=`auth-dialog`,this.dialog.innerHTML=`
      <div class="auth-toggle">
        <button type="button" id="toggle-login" class="active">Login</button>
        <button type="button" id="toggle-register">Register</button>
      </div>

      <div id="login-view">
        <h2>Welcome Back!</h2>
        <p class="subtitle">Sign in to resume your games and progress.</p>
        
        <div class="form-group">
          <label>Email Address</label>
          <div class="input-wrapper">
            <img class="icon-left" src="${a}" alt="Mail" />
            <input type="email" placeholder="e.g. alex@minigames.com" />
          </div>
        </div>

        <div class="form-group">
          <label>Password</label>
          <div class="input-wrapper">
            <img class="icon-left" src="${i}" alt="Lock" />
            <input type="password" placeholder="••••••••" />
            <img class="icon-right" src="${s}" alt="Visibility" />
          </div>
        </div>

        <a class="forgot-password">Forgot Password?</a>
        <button class="btn-primary" type="button">Login</button>

        <div class="divider">OR</div>
        
        <button class="btn-google" type="button">
          <img src="${r}" alt="Google" /> Continue with Google
        </button>

        <div class="auth-footer">
          Don't have an account? <a id="switch-to-register">Register</a>
        </div>
      </div>

      <div id="register-view">
        <h2>Create Account</h2>
        <p class="subtitle">Join MiniGames to track your score & streak.</p>
        
        <div class="form-group">
          <label>Username</label>
          <div class="input-wrapper">
            <img class="icon-left" src="${o}" alt="User" />
            <input type="text" placeholder="e.g. CozyGamer_99" />
          </div>
        </div>

        <div class="form-group">
          <label>Email Address</label>
          <div class="input-wrapper">
            <img class="icon-left" src="${a}" alt="Mail" />
            <input type="email" placeholder="your.email@domain.com" />
          </div>
        </div>

        <div class="form-group">
          <label>Password</label>
          <div class="input-wrapper">
            <img class="icon-left" src="${i}" alt="Lock" />
            <input type="password" placeholder="Min. 8 characters" />
          </div>
        </div>

        <div class="form-group">
          <label>Confirm Password</label>
          <div class="input-wrapper">
            <img class="icon-left" src="${i}" alt="Lock" />
            <input type="password" placeholder="Repeat your password" />
          </div>
        </div>

        <button class="btn-primary" type="button" style="margin-top: 16px;">Create Account</button>

        <div class="divider">OR</div>
        
        <button class="btn-google" type="button">
          <img src="${r}" alt="Google" /> Sign up with Google
        </button>

        <div class="auth-footer">
          Already have an account? <a id="switch-to-login">Login</a>
        </div>
      </div>
    `,this.backdrop.append(this.dialog),document.body.append(this.backdrop)}attachEvents(){this.backdrop.addEventListener(`click`,e=>{e.target===this.backdrop&&this.close()});let e=this.dialog.querySelector(`#toggle-login`),t=this.dialog.querySelector(`#toggle-register`),n=this.dialog.querySelector(`#switch-to-login`),r=this.dialog.querySelector(`#switch-to-register`),i=()=>{this.dialog.classList.remove(`view-register`),e?.classList.add(`active`),t?.classList.remove(`active`)},a=()=>{this.dialog.classList.add(`view-register`),t?.classList.add(`active`),e?.classList.remove(`active`)};e?.addEventListener(`click`,i),n?.addEventListener(`click`,i),t?.addEventListener(`click`,a),r?.addEventListener(`click`,a),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&this.backdrop.classList.contains(`is-open`)&&this.close()})}open(){this.backdrop.classList.add(`is-open`),document.body.style.overflow=`hidden`}close(){this.backdrop.classList.remove(`is-open`),document.body.style.overflow=``}},l=class{element;isOpen=!1;constructor(e){this.element=document.createElement(`div`),this.element.className=`burger-menu-overlay`,this.element.innerHTML=`
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
        <a href="/" class="nav-item${e===`/`?` active`:``}" data-link>Home</a>
        <a href="/library" class="nav-item${e===`/library`?` active`:``}" data-link>Library</a>
        <a href="/" class="nav-item" data-link>Tournaments</a>
        <a href="/" class="nav-item" data-link>Community</a>
      </nav>

      <div class="burger-auth">
        <button type="button" class="btn-login" id="burger-login-btn">Log In</button>
        <button type="button" class="btn-signup" id="burger-signup-btn">Sign Up</button>
      </div>
    `,this.bindEvents()}bindEvents(){this.element.querySelector(`.burger-close`)?.addEventListener(`click`,()=>this.close()),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&this.isOpen&&this.close()});let e=this.element.querySelector(`#burger-login-btn`),t=this.element.querySelector(`#burger-signup-btn`);e?.addEventListener(`click`,e=>{e.preventDefault(),this.close(),c.open()}),t?.addEventListener(`click`,e=>{e.preventDefault(),this.close(),c.open()});let n=this.element.querySelectorAll(`.nav-item`);for(let e of n)e.addEventListener(`click`,()=>this.close())}open(){this.isOpen=!0,this.element.classList.add(`is-open`),document.body.style.overflow=`hidden`}close(){this.isOpen=!1,this.element.classList.remove(`is-open`),document.body.style.overflow=``}getElement(){return this.element}};function u(e){let n=document.createElement(`header`);n.className=`site-header`,n.innerHTML=`
    <div class="header-inner">
      <a href="/" class="header-brand" data-link>
        <div class="header-logo-icon">
          <img src="${t}" alt="Logo" />
        </div>
        <span class="header-logo-text">MiniGames</span>
      </a>

      <nav class="header-nav">
        <a href="/" class="nav-item${e===`/`?` active`:``}" data-link>Home</a>
        <a href="/library" class="nav-item${e===`/library`?` active`:``}" data-link>Library</a>
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
  `;let r=n.querySelector(`#login-btn`),i=n.querySelector(`#signup-btn`);r?.addEventListener(`click`,e=>{e.preventDefault(),c.open()}),i?.addEventListener(`click`,e=>{e.preventDefault(),c.open()});let a=new l(e);return document.body.append(a.getElement()),n.querySelector(`.burger-toggle`)?.addEventListener(`click`,()=>a.open()),n}function d(){let e=document.createElement(`section`);return e.className=`hero-section`,e.innerHTML=`
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
  `,e}var f=`data:image/svg+xml,%3csvg%20width='20'%20height='19'%20viewBox='0%200%2020%2019'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M6.85%2014.825L10%2012.925L13.15%2014.85L12.325%2011.25L15.1%208.85L11.45%208.525L10%205.125L8.55%208.5L4.9%208.825L7.675%2011.25L6.85%2014.825ZM3.825%2019L5.45%2011.975L0%207.25L7.2%206.625L10%200L12.8%206.625L20%207.25L14.55%2011.975L16.175%2019L10%2015.275L3.825%2019Z'%20fill='%23FFD02B'/%3e%3c/svg%3e`,p=`data:image/svg+xml,%3csvg%20width='20'%20height='19'%20viewBox='0%200%2020%2019'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M10%2018.35L8.55%2017.05C6.86667%2015.5333%205.475%2014.225%204.375%2013.125C3.275%2012.025%202.4%2011.0417%201.75%2010.175C1.1%209.29167%200.641667%208.48333%200.375%207.75C0.125%207.01667%200%206.26667%200%205.5C0%203.93333%200.525%202.625%201.575%201.575C2.625%200.525%203.93333%200%205.5%200C6.36667%200%207.19167%200.183333%207.975%200.55C8.75833%200.916667%209.43333%201.43333%2010%202.1C10.5667%201.43333%2011.2417%200.916667%2012.025%200.55C12.8083%200.183333%2013.6333%200%2014.5%200C16.0667%200%2017.375%200.525%2018.425%201.575C19.475%202.625%2020%203.93333%2020%205.5C20%206.26667%2019.8667%207.01667%2019.6%207.75C19.35%208.48333%2018.9%209.29167%2018.25%2010.175C17.6%2011.0417%2016.725%2012.025%2015.625%2013.125C14.525%2014.225%2013.1333%2015.5333%2011.45%2017.05L10%2018.35ZM10%2015.65C11.6%2014.2167%2012.9167%2012.9917%2013.95%2011.975C14.9833%2010.9417%2015.8%2010.05%2016.4%209.3C17%208.53333%2017.4167%207.85834%2017.65%207.275C17.8833%206.675%2018%206.08333%2018%205.5C18%204.5%2017.6667%203.66667%2017%203C16.3333%202.33333%2015.5%202%2014.5%202C13.7167%202%2012.9917%202.225%2012.325%202.675C11.6583%203.10833%2011.2%203.66667%2010.95%204.35H9.05C8.8%203.66667%208.34167%203.10833%207.675%202.675C7.00833%202.225%206.28333%202%205.5%202C4.5%202%203.66667%202.33333%203%203C2.33333%203.66667%202%204.5%202%205.5C2%206.08333%202.11667%206.675%202.35%207.275C2.58333%207.85834%203%208.53333%203.6%209.3C4.2%2010.05%205.01667%2010.9417%206.05%2011.975C7.08333%2012.9917%208.4%2014.2167%2010%2015.65Z'%20fill='%23FF4B4B'/%3e%3c/svg%3e`,m=[{title:`Candy Crush`,image:`/minigames/assets/Game%20Card%20-%20Candy%20Crush-BFyEbBZ6.png`,rating:`4.6`,likes:`89.0K`},{title:`ISLANDERS: New Shores`,image:`/minigames/assets/Game%20Card%20-%20Islanders%20New%20Shores-DDuAg2Gr.png`,rating:`4.9`,likes:`54.2K`},{title:`Vacation Cafe Simulator`,image:`/minigames/assets/Game%20Card%20-%20Vacation%20Cafe%20Simulator-KK_EFf11.png`,rating:`4.8`,likes:`28.7K`},{title:`Winter Burrow`,image:`/minigames/assets/Game%20Card%20-%20Winter%20Burrow-CGq3U16Y.png`,rating:`4.9`,likes:`32.4K`},{title:`Bubble Shooter`,image:`/minigames/assets/Game%20Card%20-%20Bubble%20Shooter-CbJ-ddeT.png`,rating:`4.7`,likes:`12.1K`}];function h(e,t){return`
    <div class="game-card${t===2?` game-card-wide`:``}">
      <img src="${e.image}" alt="${e.title}" class="game-image" />
      <div class="game-info-overlay">
        <h3 class="game-title" title="${e.title}">${e.title}</h3>
        <div class="game-stats">
          <div class="stat-item rating">
            <img src="${f}" alt="Star" />
            <span>${e.rating}</span>
          </div>
          <div class="stat-item likes">
            <img src="${p}" alt="Heart" />
            <span>${e.likes}</span>
          </div>
        </div>
      </div>
    </div>
  `}function g(){let e=document.createElement(`section`);return e.className=`new-games-section`,e.innerHTML=`
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
      ${m.map((e,t)=>h(e,t)).join(``)}
    </div>
  `,setTimeout(()=>{let t=e.querySelector(`.carousel-container`);t&&(t.scrollLeft=144)},0),e}var _={data:[{rank:1,playerName:`Alex_Pro99`,gamesPlayed:142,totalScore:94250,streakDays:12,favoriteGameSlug:`heartopia`,favoriteGameName:`Heartopia`},{rank:2,playerName:`CozyGamer_x`,gamesPlayed:118,totalScore:81400,streakDays:8,favoriteGameSlug:`cat-mail-co`,favoriteGameName:`Cat Mail Co.`},{rank:3,playerName:`MatchMaster`,gamesPlayed:98,totalScore:72110,streakDays:5,favoriteGameSlug:`tiny-glade`,favoriteGameName:`Tiny Glade`},{rank:4,playerName:`BubblePop`,gamesPlayed:87,totalScore:65900,streakDays:3,favoriteGameSlug:`whisper-of-the-house`,favoriteGameName:`Whisper of the House`},{rank:5,playerName:`SudokuGod`,gamesPlayed:74,totalScore:59320,streakDays:2,favoriteGameSlug:`cat-chess`,favoriteGameName:`Cat Chess`}],meta:{totalItems:5,description:`Top Players This Week`}};function v(e){return e.toLocaleString(`en-US`)}function y(e){return(e/1e3).toFixed(1)+`K`}function b(e){let t=e.match(/[A-Z]/g);return t&&t.length>=2?t[0]+t[1]:e.slice(0,2).toUpperCase()}function x(){let e=document.createElement(`section`);return e.className=`leaderboard-section`,e.innerHTML=`
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
      ${_.data.map(e=>`
    <div class="lb-row lb-data rank-${e.rank}">
      <div class="lb-cell cell-rank ${e.rank===1?`top-1`:``} ${e.rank===2?`top-2`:``} ${e.rank===3?`top-3`:``}">
        <span class="desktop-val">#${e.rank}</span>
        <span class="tablet-val">#${e.rank}</span>
        <span class="mobile-val">#${e.rank}</span>
      </div>
      <div class="lb-cell cell-player">
        <div class="player-avatar bg-${e.rank}">${b(e.playerName)}</div>
        <span class="player-name">${e.playerName}</span>
      </div>
      <div class="lb-cell col-games">${e.gamesPlayed}</div>
      <div class="lb-cell cell-score">
        <span class="desktop-val">${v(e.totalScore)}</span>
        <span class="tablet-val">${v(e.totalScore)}</span>
        <span class="mobile-val">${y(e.totalScore)}</span>
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
  `,e}var S=`/minigames/assets/working-station-CM8ozyRC.png`;function C(){let e=document.createElement(`section`);return e.className=`developer-cta-section`,e.innerHTML=`
    <div class="cta-image-wrapper">
      <img src="${S}" alt="Developer working station with a game on screen" />
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
  `,e}var w=`data:image/svg+xml,%3csvg%20width='40'%20height='40'%20viewBox='0%200%2040%2040'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M0%2020C0%208.95431%208.95431%200%2020%200V0C31.0457%200%2040%208.95431%2040%2020V20C40%2031.0457%2031.0457%2040%2020%2040V40C8.95431%2040%200%2031.0457%200%2020V20Z'%20fill='%232A264F'/%3e%3cpath%20d='M23.5%2028C22.8056%2028%2022.2153%2027.7569%2021.7292%2027.2708C21.2431%2026.7847%2021%2026.1944%2021%2025.5C21%2025.375%2021.0278%2025.1736%2021.0833%2024.8958L16.1458%2021.875C15.9236%2022.0694%2015.6736%2022.2222%2015.3958%2022.3333C15.1181%2022.4444%2014.8194%2022.5%2014.5%2022.5C13.8056%2022.5%2013.2153%2022.2569%2012.7292%2021.7708C12.2431%2021.2847%2012%2020.6944%2012%2020C12%2019.3056%2012.2431%2018.7153%2012.7292%2018.2292C13.2153%2017.7431%2013.8056%2017.5%2014.5%2017.5C14.8194%2017.5%2015.1181%2017.5556%2015.3958%2017.6667C15.6736%2017.7778%2015.9236%2017.9306%2016.1458%2018.125L21.0833%2015.1042C21.0556%2015.0069%2021.0347%2014.9097%2021.0208%2014.8125C21.0069%2014.7153%2021%2014.6111%2021%2014.5C21%2013.8056%2021.2431%2013.2153%2021.7292%2012.7292C22.2153%2012.2431%2022.8056%2012%2023.5%2012C24.1944%2012%2024.7847%2012.2431%2025.2708%2012.7292C25.7569%2013.2153%2026%2013.8056%2026%2014.5C26%2015.1944%2025.7569%2015.7847%2025.2708%2016.2708C24.7847%2016.7569%2024.1944%2017%2023.5%2017C23.1806%2017%2022.8819%2016.9444%2022.6042%2016.8333C22.3264%2016.7222%2022.0764%2016.5694%2021.8542%2016.375L16.9167%2019.3958C16.9444%2019.4931%2016.9653%2019.5903%2016.9792%2019.6875C16.9931%2019.7847%2017%2019.8889%2017%2020C17%2020.1111%2016.9931%2020.2153%2016.9792%2020.3125C16.9653%2020.4097%2016.9444%2020.5069%2016.9167%2020.6042L21.8542%2023.625C22.0764%2023.4306%2022.3264%2023.2778%2022.6042%2023.1667C22.8819%2023.0556%2023.1806%2023%2023.5%2023C24.1944%2023%2024.7847%2023.2431%2025.2708%2023.7292C25.7569%2024.2153%2026%2024.8056%2026%2025.5C26%2026.1944%2025.7569%2026.7847%2025.2708%2027.2708C24.7847%2027.7569%2024.1944%2028%2023.5%2028ZM23.5%2026.5C23.7778%2026.5%2024.0139%2026.4028%2024.2083%2026.2083C24.4028%2026.0139%2024.5%2025.7778%2024.5%2025.5C24.5%2025.2222%2024.4028%2024.9861%2024.2083%2024.7917C24.0139%2024.5972%2023.7778%2024.5%2023.5%2024.5C23.2222%2024.5%2022.9861%2024.5972%2022.7917%2024.7917C22.5972%2024.9861%2022.5%2025.2222%2022.5%2025.5C22.5%2025.7778%2022.5972%2026.0139%2022.7917%2026.2083C22.9861%2026.4028%2023.2222%2026.5%2023.5%2026.5ZM14.5%2021C14.7778%2021%2015.0139%2020.9028%2015.2083%2020.7083C15.4028%2020.5139%2015.5%2020.2778%2015.5%2020C15.5%2019.7222%2015.4028%2019.4861%2015.2083%2019.2917C15.0139%2019.0972%2014.7778%2019%2014.5%2019C14.2222%2019%2013.9861%2019.0972%2013.7917%2019.2917C13.5972%2019.4861%2013.5%2019.7222%2013.5%2020C13.5%2020.2778%2013.5972%2020.5139%2013.7917%2020.7083C13.9861%2020.9028%2014.2222%2021%2014.5%2021ZM23.5%2015.5C23.7778%2015.5%2024.0139%2015.4028%2024.2083%2015.2083C24.4028%2015.0139%2024.5%2014.7778%2024.5%2014.5C24.5%2014.2222%2024.4028%2013.9861%2024.2083%2013.7917C24.0139%2013.5972%2023.7778%2013.5%2023.5%2013.5C23.2222%2013.5%2022.9861%2013.5972%2022.7917%2013.7917C22.5972%2013.9861%2022.5%2014.2222%2022.5%2014.5C22.5%2014.7778%2022.5972%2015.0139%2022.7917%2015.2083C22.9861%2015.4028%2023.2222%2015.5%2023.5%2015.5Z'%20fill='white'/%3e%3c/svg%3e`,T=`data:image/svg+xml,%3csvg%20width='40'%20height='40'%20viewBox='0%200%2040%2040'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M0%2020C0%208.95431%208.95431%200%2020%200V0C31.0457%200%2040%208.95431%2040%2020V20C40%2031.0457%2031.0457%2040%2020%2040V40C8.95431%2040%200%2031.0457%200%2020V20Z'%20fill='%232A264F'/%3e%3cpath%20d='M15%2022H22V20.5H15V22ZM15%2019.25H25V17.75H15V19.25ZM15%2016.5H25V15H15V16.5ZM12%2028V13.5C12%2013.0833%2012.1458%2012.7292%2012.4375%2012.4375C12.7292%2012.1458%2013.0833%2012%2013.5%2012H26.5C26.9167%2012%2027.2708%2012.1458%2027.5625%2012.4375C27.8542%2012.7292%2028%2013.0833%2028%2013.5V23.5C28%2023.9167%2027.8542%2024.2708%2027.5625%2024.5625C27.2708%2024.8542%2026.9167%2025%2026.5%2025H15L12%2028ZM14.375%2023.5H26.5V13.5H13.5V24.375L14.375%2023.5ZM13.5%2023.5V13.5V23.5Z'%20fill='white'/%3e%3c/svg%3e`,E=`data:image/svg+xml,%3csvg%20width='40'%20height='40'%20viewBox='0%200%2040%2040'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M0%2020C0%208.95431%208.95431%200%2020%200V0C31.0457%200%2040%208.95431%2040%2020V20C40%2031.0457%2031.0457%2040%2020%2040V40C8.95431%2040%200%2031.0457%200%2020V20Z'%20fill='%232A264F'/%3e%3cpath%20d='M14.5%2027C14.0833%2027%2013.7292%2026.8542%2013.4375%2026.5625C13.1458%2026.2708%2013%2025.9167%2013%2025.5C13%2025.0833%2013.1458%2024.7292%2013.4375%2024.4375C13.7292%2024.1458%2014.0833%2024%2014.5%2024C14.9167%2024%2015.2708%2024.1458%2015.5625%2024.4375C15.8542%2024.7292%2016%2025.0833%2016%2025.5C16%2025.9167%2015.8542%2026.2708%2015.5625%2026.5625C15.2708%2026.8542%2014.9167%2027%2014.5%2027ZM25%2027C25%2025.3333%2024.6806%2023.7778%2024.0417%2022.3333C23.4167%2020.875%2022.5625%2019.6042%2021.4792%2018.5208C20.3958%2017.4375%2019.125%2016.5833%2017.6667%2015.9583C16.2222%2015.3194%2014.6667%2015%2013%2015V13C14.9444%2013%2016.7569%2013.3681%2018.4375%2014.1042C20.1319%2014.8264%2021.6181%2015.8264%2022.8958%2017.1042C24.1736%2018.3819%2025.1736%2019.8681%2025.8958%2021.5625C26.6319%2023.2431%2027%2025.0556%2027%2027H25ZM20%2027C20%2026.0278%2019.8194%2025.1181%2019.4583%2024.2708C19.0972%2023.4236%2018.5972%2022.6806%2017.9583%2022.0417C17.3194%2021.4028%2016.5764%2020.9028%2015.7292%2020.5417C14.8819%2020.1806%2013.9722%2020%2013%2020V18C14.2639%2018%2015.4375%2018.2361%2016.5208%2018.7083C17.6042%2019.1667%2018.5556%2019.8056%2019.375%2020.625C20.1944%2021.4444%2020.8333%2022.3958%2021.2917%2023.4792C21.7639%2024.5625%2022%2025.7361%2022%2027H20Z'%20fill='white'/%3e%3c/svg%3e`,D=`data:image/svg+xml,%3csvg%20viewBox='0%200%2064%2064'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_5701_38384)'%3e%3ccircle%20cx='32'%20cy='32'%20r='32'%20fill='black'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M13%2021.5095V42.5L19.3067%2042.4621V33.9474C20.0567%2033.9474%2020.7616%2033.9775%2021.4049%2034.4267C21.8946%2034.8785%2022.2838%2035.4335%2022.546%2036.054L25.9202%2042.4621H33C31.5957%2039.6675%2030.4706%2036.1327%2028.0552%2034.0104C27.5455%2033.6749%2026.9919%2033.4158%2026.411%2033.241C27.1873%2033.0779%2027.9357%2032.7973%2028.6319%2032.4084C30.3855%2031.3375%2031.3915%2029.3808%2031.3436%2027.3374C31.3798%2026.1328%2031.0495%2024.9466%2030.3988%2023.9441C28.9256%2021.6883%2025.9337%2021.4213%2023.4663%2021.5095H13ZM21.9939%2030.0116H19.3313V25.6975H22.1043C23.4807%2025.5594%2025.1814%2026.1754%2025.0859%2027.8041C25.1499%2029.5621%2023.3647%2029.9127%2021.9939%2030.0116Z'%20fill='%23FFB749'/%3e%3cpath%20d='M39.4768%2035.089L33%2035.4666C33.1262%2037.3671%2034.0021%2039.16%2035.4636%2040.5088C36.9117%2041.8323%2039.5076%2042.4941%2043.2515%2042.4941C46.3564%2042.5823%2049.9058%2041.8146%2051.821%2039.1569C52.5929%2038.0934%2053.0033%2036.8427%2052.9998%2035.564C53.0217%2033.1848%2051.4339%2031.2297%2049.3044%2030.3147C47.2632%2029.4766%2045.1198%2028.8674%2042.9204%2028.5C42.1107%2028.41%2041.3327%2028.1563%2040.6423%2027.757C39.9039%2027.2597%2040.078%2026.2272%2040.735%2025.7596C42.6084%2024.5207%2045.6299%2025.5545%2045.8608%2027.9032L52.2845%2027.5621C52.1703%2025.768%2051.1844%2024.0545%2049.6356%2022.9583C47.6987%2021.8887%2045.4532%2021.3874%2043.1986%2021.5212C41.3493%2021.4527%2039.5037%2021.7218%2037.7682%2022.3128C35.6082%2023.1125%2033.829%2025.064%2033.8344%2027.4525C33.7931%2028.9377%2034.5158%2030.4088%2035.755%2031.3621C37.6454%2032.6238%2039.8325%2033.4582%2042.139%2033.798C43.3833%2033.9637%2044.5727%2034.3795%2045.6224%2035.0159C46.5878%2035.7309%2046.5807%2037.167%2045.5959%2037.8903C44.5078%2038.6532%2042.9034%2038.7416%2041.6818%2038.2468C40.3717%2037.716%2039.6048%2036.4784%2039.4768%2035.089Z'%20fill='%23FFB749'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_5701_38384'%3e%3crect%20width='64'%20height='64'%20fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e`;function O(){let e=document.createElement(`footer`);return e.className=`footer-section`,e.innerHTML=`
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
            <a href="/" class="social-btn"><img src="${w}" alt="Share" /></a>
            <a href="/" class="social-btn"><img src="${T}" alt="Chat" /></a>
            <a href="/" class="social-btn"><img src="${E}" alt="RSS" /></a>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-divider"></div>
    <div class="footer-bottom">
      <div class="copyright">© 2026 MiniGames. All rights reserved.</div>
      <div class="partners">
        <a href="https://rs.school/courses/short-track" target="_blank" rel="noopener noreferrer">
          <img src="${D}" alt="RS School" /> RS School
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
  `,e}function k(e){let t=document.createElement(`div`);return t.className=`page-container`,t.append(u(e)),t.append(d()),t.append(g()),t.append(x()),t.append(C()),t.append(O()),t}function A(e){let t=document.createElement(`div`);return t.className=`page-container`,t.append(u(e)),t.append(O()),t}var j=document.querySelector(`#app`);if(j){let t=new e(j,`/minigames`);t.addRoute(`/`,k),t.addRoute(`/library`,A),t.handleRoute()}