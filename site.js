// ── Shared head elements ──────────────────────────────────────

(function () {
  const head = document.head;

  const favicon = document.createElement('link');
  favicon.rel = 'icon'; favicon.href = '/assets/favicon.ico'; favicon.type = 'image/x-icon';
  head.appendChild(favicon);

  const preconnect1 = document.createElement('link');
  preconnect1.rel = 'preconnect'; preconnect1.href = 'https://fonts.googleapis.com';
  head.appendChild(preconnect1);

  const preconnect2 = document.createElement('link');
  preconnect2.rel = 'preconnect'; preconnect2.href = 'https://fonts.gstatic.com';
  preconnect2.crossOrigin = 'anonymous';
  head.appendChild(preconnect2);

  const fonts = document.createElement('link');
  fonts.rel = 'stylesheet';
  fonts.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap';
  head.appendChild(fonts);

  const siteCss = document.createElement('link');
  siteCss.rel = 'stylesheet'; siteCss.href = '/site.css';
  head.appendChild(siteCss);
})();

// ── Shared components ─────────────────────────────────────────

const HEADER = `
<header class="site-header" id="site-header">
  <div class="header-inner">
    <a href="/" class="logo-link">
      <img src="/assets/logos/kesai.png" alt="KE:SAI" class="logo-img">
    </a>
    <nav class="site-nav">
      <a href="/publications">Publications</a>
      <a href="/blog">Blog</a>
      <div class="nav-dropdown">
        <button class="nav-dropdown-trigger" aria-expanded="false" aria-haspopup="true">
          About Us
          <svg class="chevron" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
            <path d="M1 1.5l5 5 5-5"/>
          </svg>
        </button>
        <div class="nav-dropdown-menu" role="menu">
          <a href="/team" role="menuitem">Team</a>
          <a href="/join" role="menuitem">Join Us</a>
        </div>
      </div>
    </nav>
    <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="mobile-nav" id="mobile-nav">
    <a href="/publications">Publications</a>
    <a href="/blog">Blog</a>
    <span class="mobile-nav-group">About Us</span>
    <a href="/team" class="mobile-nav-sub">Team</a>
    <a href="/join" class="mobile-nav-sub">Join Us</a>
  </div>
</header>`;

const FOOTER = `
<footer class="site-footer">
  <div class="footer-inner">
    <span class="footer-copy">© 2026 KE:SAI</span>
    <span class="footer-location">Tübingen &amp; Paris</span>
    <a href="mailto:info@kesai.eu" class="footer-contact">info@kesai.eu</a>
  </div>
</footer>`;

// Inject header and footer
document.getElementById('site-header').outerHTML = HEADER;
document.getElementById('site-footer').outerHTML = FOOTER;

// Mark active nav link based on current path segment
const segment = '/' + (location.pathname.replace(/\/$/, '').split('/').pop() || '');
const aboutPages = ['/team', '/join'];

document.querySelectorAll('.site-nav a, .mobile-nav a').forEach(a => {
  if (a.getAttribute('href') === segment) a.classList.add('active');
});

// Highlight the "About Us" dropdown trigger when on an about sub-page
if (aboutPages.includes(segment)) {
  document.querySelector('.nav-dropdown-trigger')?.classList.add('active');
}

// ── Dropdown ──────────────────────────────────────────────────

const dropdown = document.querySelector('.nav-dropdown');
const trigger  = document.querySelector('.nav-dropdown-trigger');
const menu     = document.querySelector('.nav-dropdown-menu');

trigger.addEventListener('click', (e) => {
  const open = trigger.getAttribute('aria-expanded') === 'true';
  trigger.setAttribute('aria-expanded', String(!open));
  menu.classList.toggle('open', !open);
  e.stopPropagation();
});

// Close on outside click
document.addEventListener('click', () => {
  trigger.setAttribute('aria-expanded', 'false');
  menu.classList.remove('open');
});

// ── Mobile nav toggle ─────────────────────────────────────────

document.getElementById('nav-toggle').addEventListener('click', () => {
  document.getElementById('mobile-nav').classList.toggle('open');
});

document.querySelectorAll('.mobile-nav a').forEach(a => {
  a.addEventListener('click', () => {
    document.getElementById('mobile-nav').classList.remove('open');
  });
});
