// ── Publication helpers ────────────────────────────────────────
window.toggleAbstract = function (btn) {
  const wrap = btn.closest('.pub-body').querySelector('.pub-abstract-wrap');
  const el   = wrap.querySelector('.pub-abstract');
  const expanding = !wrap.classList.contains('expanded');

  if (expanding) {
    const full = el.scrollHeight;
    el.style.maxHeight = full + 'px';
    el.addEventListener('transitionend', () => { el.style.maxHeight = 'none'; el.style.overflow = 'visible'; }, { once: true });
    wrap.classList.add('expanded');
  } else {
    el.style.overflow = 'hidden';
    el.style.maxHeight = el.scrollHeight + 'px';
    el.offsetHeight; // force reflow
    el.style.maxHeight = '5.95rem';
    wrap.classList.remove('expanded');
  }

  btn.innerHTML = expanding
    ? 'Read less <i class="fa-solid fa-chevron-up" aria-hidden="true"></i>'
    : 'Read more <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>';
};

window.openBibtex = function (btn) {
  btn.closest('.pub-action-row').closest('.pub-body').querySelector('.pub-bibtex-modal').classList.add('open');
};


window.copyBibtex = function (btn) {
  const code = btn.nextElementSibling.textContent;
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
  });
};

// Close bibtex modal on backdrop click or Escape
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('pub-bibtex-modal')) e.target.classList.remove('open');
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') document.querySelectorAll('.pub-bibtex-modal.open').forEach(m => m.classList.remove('open'));
});

// ── Scroll hint (mobile) ──────────────────────────────────────
(function () {
  const hint = document.getElementById('scroll-hint');
  if (!hint) return;

  // Expose a function so the animation sequence can fade it in at the right moment
  const _nt = performance.getEntriesByType && performance.getEntriesByType('navigation')[0]?.type;
  const _willAnimate = (_nt === 'reload' || !sessionStorage.getItem('heroAnimated')) && !!document.querySelector('.hero-logo');
  window._showScrollHint = function () {
    hint.style.transition = 'opacity 0.7s ease';
    hint.style.opacity = '1';
    setTimeout(() => { hint.style.transition = ''; }, 700);
  };
  if (!_willAnimate) window._showScrollHint(); // show immediately on logo-click navigation

  // Fade out proportionally as user scrolls
  window.addEventListener('scroll', () => {
    const opacity = Math.max(0, 1 - window.scrollY / 120);
    hint.style.opacity = opacity;
    hint.style.pointerEvents = opacity < 0.05 ? 'none' : 'auto';
  }, { passive: true });

  // Smooth scroll to first section in 250ms
  hint.addEventListener('click', () => {
    const target = document.querySelector('.lp-section');
    if (!target) return;
    const start = window.scrollY;
    const end   = target.getBoundingClientRect().top + window.scrollY;
    const duration = 500;
    const t0 = performance.now();
    // Disable CSS smooth scroll so it doesn't fight the JS animation
    document.documentElement.style.scrollBehavior = 'auto';
    function step(now) {
      const p = Math.min((now - t0) / duration, 1);
      const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      window.scrollTo(0, start + (end - start) * ease);
      if (p < 1) requestAnimationFrame(step);
      else document.documentElement.style.scrollBehavior = '';
    }
    requestAnimationFrame(step);
  });
})();

// ── Scroll position save/restore ──────────────────────────────
(function () {
  const key = 'scrollY:' + location.pathname;
  const saved = sessionStorage.getItem(key);

  // Don't restore scroll when hero animation will play — start at top
  const _nt = performance.getEntriesByType && performance.getEntriesByType('navigation')[0]?.type;
  const willAnimate = _nt === 'reload' || !sessionStorage.getItem('heroAnimated');

  if (saved && !willAnimate) {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, +saved);
    requestAnimationFrame(() => document.documentElement.style.scrollBehavior = '');
  }
  // Always clear saved position when animating (so no stale restore after animation)
  if (willAnimate) sessionStorage.removeItem(key);

  window.addEventListener('beforeunload', () => sessionStorage.setItem(key, window.scrollY));
})();

// ── Shared components ─────────────────────────────────────────

const HEADER = `
<header class="site-header" id="site-header">
  <div class="header-inner">
    <a href="/" class="logo-link">
      <img src="/assets/logos/kesai_transparent.png" alt="KE:SAI" class="logo-img">
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

    <div class="footer-brand">
      <div class="footer-partner-logos">
        <a href="https://kyutai.org/" target="_blank"><img src="/assets/logos/kyutai.png" alt="Kyutai"></a>
        <a href="https://ellis.eu/research/sites/institute-tubingen" target="_blank"><img src="/assets/logos/ellis_tuebingen.png" alt="ELLIS Institute Tübingen"></a>
      </div>
      <p class="footer-tagline">KE:SAI is a Franco-German non-profit open science lab for scalable autonomous intelligence, co-founded by kyutai and the ELLIS Institute Tübingen.</p>
      <p class="footer-tagline">© 2026 KE:SAI &mdash; Kyutai ELLIS Scalable Autonomous Intelligence</p>
    </div>

    <div class="footer-cols">

      <div class="footer-col">
        <span class="footer-col-heading">Community</span>
        <a href="#">LinkedIn</a>
        <!--<a href="#">Newsletter</a>-->
      </div>

      <div class="footer-col">
        <span class="footer-col-heading">Resources</span>
        <a href="/blog">Blog</a>
        <a href="https://github.com/kesai-labs/">GitHub</a>
        <a href="https://huggingface.co/kesai-labs">Hugging Face</a>
        <a href="/publications">Publications</a>
      </div>

      <div class="footer-col">
        <span class="footer-col-heading">About Us</span>
        <a href="/join">Join Us</a>
        <a href="/team">Team</a>
        <a href="mailto:press@kesai.eu">Press</a>
      </div>

    </div>
  </div>

</footer>`;

// Inject header and footer
document.getElementById('site-header').outerHTML = HEADER;
document.getElementById('site-footer').outerHTML = FOOTER;

// Determine whether to play hero animation:
// yes on hard reload or true first visit; no when navigating via link within the session
const _navType = performance.getEntriesByType('navigation')[0]?.type;
const _animKey  = 'heroAnimated';
const showHeroAnimation = _navType === 'reload' || !sessionStorage.getItem(_animKey);
if (showHeroAnimation) sessionStorage.setItem(_animKey, '1');

// If no animation (logo click), lift the pre-hide immediately
if (!showHeroAnimation) document.documentElement.classList.remove('hero-animating');

// Hide header until hero animation is ready (landing page + animation only)
const siteHeader = document.querySelector('.site-header');
if (siteHeader && document.querySelector('.hero-logo') && showHeroAnimation) {
  siteHeader.classList.add('header-hidden');
}

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

// ── Header scroll state ───────────────────────────────────────

(function () {
  const hdr = document.querySelector('.site-header');
  if (!hdr) return;
  const tick = () => hdr.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', tick, { passive: true });
  tick();
})();

// ── Scroll reveal ─────────────────────────────────────────────

(function () {
  const heroLogo   = document.querySelector('.hero-logo');
  const heroSlogan = document.querySelector('.hero-slogan');
  const isLandingPage = !!heroLogo;

  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    }),
    { threshold: 0.12 }
  );

  // Collect all candidate elements with their stagger delays
  const candidates = [];

  document.querySelectorAll('.team-card').forEach((el, i) => {
    el.style.transitionDelay = (i * 70) + 'ms';
    candidates.push(el);
  });
  ['.hero-logo', '.hero-slogan', '.page-title', '.founders-title',
   '.section-eyebrow', '.section-title', '.section-body', '.founders-photo', '.photo-caption']
    .forEach(sel => document.querySelectorAll(sel).forEach(el => candidates.push(el)));
  document.querySelectorAll('.feature-card').forEach((el, i) => {
    el.style.transitionDelay = (i % 3 * 80) + 'ms';
    candidates.push(el);
  });
  document.querySelectorAll('.track-record-list li').forEach((el, i) => {
    el.style.transitionDelay = (i * 40) + 'ms';
    candidates.push(el);
  });

  const landingInView = [];
  const teamInView    = [];
  const isTeamPage    = !isLandingPage && !!document.querySelector('.team-grid');

  candidates.forEach(el => {
    if (el === heroLogo || el === heroSlogan) {
      if (showHeroAnimation) el.classList.add('reveal'); // hidden; sequenced separately
      return;
    }
    const r = el.getBoundingClientRect();
    const inViewport = r.top < window.innerHeight && r.bottom > 0;

    if (isLandingPage && showHeroAnimation && inViewport) {
      // Landing page with animation: hide viewport elements, reveal after hero sequence
      el.classList.add('reveal');
      landingInView.push(el);
    } else if (isTeamPage && inViewport && el.classList.contains('team-card')) {
      // Team page: stagger team cards in on load; other elements stay immediately visible
      teamInView.push(el);
    } else if (!inViewport) {
      // Off-screen on any page: scroll reveal
      el.classList.add('reveal');
      io.observe(el);
    }
    // else: other inner pages in viewport → leave fully visible
  });

  // Hand off from CSS pre-hiding to JS reveal classes (eliminates FOUC gap)
  document.documentElement.classList.remove('hero-animating');

  // Team page: suppress initial transition, then stagger in viewport elements
  if (isTeamPage && teamInView.length) {
    teamInView.forEach(el => {
      el.style.transition = 'none';
      el.style.transitionDelay = '0ms';
      el.classList.add('reveal');
    });
    teamInView[0].offsetHeight; // force reflow
    teamInView.forEach(el => {
      el.style.transition = '';
      el.style.transitionDelay = '';
    });
    teamInView.forEach((el, i) => setTimeout(() => el.classList.add('is-visible'), 80 + i * 80));
  }

  if (isLandingPage && showHeroAnimation) {
    document.documentElement.classList.add('scroll-locked');
    setTimeout(() => {
      heroLogo.classList.add('is-visible');
      setTimeout(() => heroSlogan.classList.add('is-visible'), 800);
      setTimeout(() => {
        document.documentElement.classList.remove('scroll-locked');
        landingInView.forEach((el, i) => setTimeout(() => el.classList.add('is-visible'), i * 100));
        if (siteHeader) {
          siteHeader.classList.remove('header-hidden');
          siteHeader.classList.add('header-visible');
        }
        if (window._showScrollHint) window._showScrollHint();
      }, 3200); // BOOKMARK 2
    }, 200);
  }
})();
