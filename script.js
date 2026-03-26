/* ═══════════════════════════════════════════════════════════════
   NILESH KUMAR PORTFOLIO — script.js
   All interactive features: cursor, particles, tilt, forms, modal
═══════════════════════════════════════════════════════════════ */
'use strict';

/* ── UTILITIES ─────────────────────────────────────────────── */
const debounce = (fn, ms = 100) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const throttle = (fn, ms = 16)  => { let last = 0; return (...a) => { const now = Date.now(); if (now - last >= ms) { last = now; fn(...a); } }; };
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ══════════════════════════════════════════════════════════════
   1. LOADER
══════════════════════════════════════════════════════════════ */
(function initLoader() {
  const overlay = $('#loaderOverlay');
  const fill    = $('#loaderFill');
  const text    = $('#loaderText');
  if (!overlay) return;

  const messages = ['Loading profile...', 'Fetching projects...', 'Ready!'];
  let progress = 0, msgIdx = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 15 + 5;

    if (progress > 40 && msgIdx === 0) { text.textContent = messages[1]; msgIdx++; }
    if (progress > 80 && msgIdx === 1) { text.textContent = messages[2]; msgIdx++; }

    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        overlay.classList.add('hidden');
        // Kick off hero reveals after load
        $$('.hero .reveal-up, .hero .reveal-right').forEach((el, i) => {
          setTimeout(() => el.classList.add('visible'), i * 100);
        });
      }, 350);
    }
    fill.style.width = progress + '%';
  }, 70);
})();

/* ══════════════════════════════════════════════════════════════
   2. THEME TOGGLE + LocalStorage
══════════════════════════════════════════════════════════════ */
(function initTheme() {
  const btn  = $('#themeToggle');
  const icon = $('#themeIcon');
  const html = document.documentElement;
  const STORAGE_KEY = 'nk-theme';

  const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
  html.setAttribute('data-theme', saved);
  setIcon(saved);

  btn.addEventListener('click', () => {
    const curr = html.getAttribute('data-theme');
    const next = curr === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
    setIcon(next);
  });

  function setIcon(t) {
    icon.className = t === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
  }
})();

/* ══════════════════════════════════════════════════════════════
   3. CUSTOM CURSOR
══════════════════════════════════════════════════════════════ */
(function initCursor() {
  const dot  = $('#cursorDot');
  const ring = $('#cursorRing');
  if (!dot || !ring) return;

  let rx = 0, ry = 0, dx = 0, dy = 0;

  document.addEventListener('mousemove', e => {
    dx = e.clientX; dy = e.clientY;
    dot.style.left = dx + 'px';
    dot.style.top  = dy + 'px';
  });

  (function animRing() {
    rx += (dx - rx) * 0.11;
    ry += (dy - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  document.addEventListener('mouseleave', () => { dot.style.opacity = 0; ring.style.opacity = 0; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = 1; ring.style.opacity = 1; });

  // Hover effect
  document.addEventListener('mouseover', e => {
    const int = e.target.closest('a, button, .tilt-card, .proj-card, .cert-card, .edu-card');
    ring.classList.toggle('hovering', !!int);
  });
})();

/* ══════════════════════════════════════════════════════════════
   4. PARTICLE CANVAS
══════════════════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = $('#particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  let mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', debounce(resize, 200));
  document.addEventListener('mousemove', throttle(e => { mouse.x = e.clientX; mouse.y = e.clientY; }, 60));

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : (Math.random() < .5 ? -5 : H + 5);
      this.size  = Math.random() * 2.5 + 1.0;
      this.vx    = (Math.random() - .5) * .35;
      this.vy    = (Math.random() - .5) * .35;
      this.alpha = Math.random() * .6 + .25;
      // Orange or cyan
      this.hue = Math.random() > .5 ? 24 : 190;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      // Mouse soft repel
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const d  = Math.sqrt(dx*dx + dy*dy);
      if (d < 90) { this.x += (dx/d) * 1.2; this.y += (dy/d) * 1.2; }
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${this.hue},85%,65%,${this.alpha})`;
      ctx.fill();
    }
  }

  const COUNT = Math.min(280, Math.floor(W * H / 4500));
  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i+1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x-b.x, dy = a.y-b.y, d = Math.sqrt(dx*dx+dy*dy);
        if (d < 110) {
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
          ctx.strokeStyle = `hsla(24,85%,60%,${.25 * (1-d/110)})`;
          ctx.lineWidth = .8; ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0,0,W,H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animate);
  }
  animate();

  document.addEventListener('visibilitychange', () => {
    canvas.style.animationPlayState = document.hidden ? 'paused' : 'running';
  });
})();

/* ══════════════════════════════════════════════════════════════
   5. NAVBAR — scroll, active, mobile
══════════════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar    = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks  = $('#navLinks');
  const links     = $$('.nav-link');
  const sections  = $$('section[id]');
  const btt       = $('#backToTop');
  const fyear     = $('#fyear');

  if (fyear) fyear.textContent = new Date().getFullYear();

  const onScroll = throttle(() => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 40);
    if (btt) btt.classList.toggle('visible', y > 380);

    let cur = '';
    sections.forEach(s => { if (y >= s.offsetTop - 130) cur = s.id; });
    links.forEach(l => {
      l.classList.remove('active');
      if (l.getAttribute('href') === '#' + cur) l.classList.add('active');
    });
  }, 80);

  window.addEventListener('scroll', onScroll, { passive: true });

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  links.forEach(l => l.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }));

  if (btt) btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ══════════════════════════════════════════════════════════════
   6. SCROLL REVEAL
══════════════════════════════════════════════════════════════ */
(function initReveal() {
  const els = $$('.reveal-up, .reveal-left, .reveal-right');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
})();

/* ══════════════════════════════════════════════════════════════
   7. SKILL BAR ANIMATION
══════════════════════════════════════════════════════════════ */
(function initSkillBars() {
  const fills = $$('.sk-fill');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.w + '%';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .5 });
  fills.forEach(f => obs.observe(f));
})();

/* ══════════════════════════════════════════════════════════════
   8. SKILLS TABS
══════════════════════════════════════════════════════════════ */
(function initTabs() {
  const tabs   = $$('.stab');
  const panels = $$('.skills-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');

      const target = $('#' + tab.dataset.tab);
      if (target) {
        target.classList.add('active');
        // Re-animate bars
        $$('.sk-fill', target).forEach(f => {
          f.style.width = '0%';
          setTimeout(() => f.style.width = f.dataset.w + '%', 80);
        });
        // Re-trigger reveals
        $$('.reveal-up', target).forEach((el, i) => {
          el.classList.remove('visible');
          setTimeout(() => el.classList.add('visible'), i * 70);
        });
      }
    });
  });
})();

/* ══════════════════════════════════════════════════════════════
   9. 3D CARD TILT
══════════════════════════════════════════════════════════════ */
function applyTilt(card, maxTilt = 9) {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - .5) * maxTilt * 2;
    const y = ((e.clientY - r.top)  / r.height - .5) * maxTilt * -2;
    card.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) scale3d(1.02,1.02,1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
  });
}
$$('.tilt-card').forEach(c => applyTilt(c));

/* ══════════════════════════════════════════════════════════════
   10. MAGNETIC BUTTONS
══════════════════════════════════════════════════════════════ */
$$('.magnetic').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width/2)  * .35;
    const y = (e.clientY - r.top  - r.height/2) * .35;
    el.style.transform = `translate(${x}px,${y}px)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transform = ''; });
});

/* ══════════════════════════════════════════════════════════════
   11. TYPEWRITER
══════════════════════════════════════════════════════════════ */
(function initTypewriter() {
  const el = $('#typewriter');
  if (!el) return;

  const roles = ['Software Engineer', 'Java Developer', 'DevOps Enthusiast', 'Data Analyst', 'Problem Solver'];
  let wi = 0, ci = 0, del = false;

  function tick() {
    const word = roles[wi];
    el.textContent = del ? word.substring(0, --ci) : word.substring(0, ++ci);

    let delay = del ? 50 : 85;
    if (!del && ci === word.length) { delay = 2200; del = true; }
    else if (del && ci === 0) { del = false; wi = (wi + 1) % roles.length; delay = 350; }
    setTimeout(tick, delay);
  }
  setTimeout(tick, 1200);
})();

/* ══════════════════════════════════════════════════════════════
   12. PROJECTS DATA + RENDER + MODAL
══════════════════════════════════════════════════════════════ */
const PROJECTS_DATA = [
  {
    id:       'croppulse',
    title:    'CropPulse – Crop Production Analytics',
    subtitle: 'Data Analytics · Power BI',
    desc:     'Analyzed 73,000+ agricultural records spanning 15 years to uncover crop production trends across India. Built interactive Power BI dashboards that surface regional performance, seasonal patterns, and top-producing areas for informed policy decisions.',
    longDesc: 'CropPulse is a comprehensive data analytics project built around a large governmental agricultural dataset. Using data modeling and DAX calculations in Power BI, I designed multiple interactive dashboards including: a national crop production heatmap, yearly trend comparisons, top-10 crop and region rankings, and YOY growth analysis. Key insight: identified 3 under-performing but high-potential regions for targeted agricultural investment.',
    tags:     ['Power BI', 'Data Modeling', 'DAX', 'Excel', 'Analytics'],
    icon:     '🌾',
    gradient: 'linear-gradient(135deg, #16a34a, #15803d)',
    highlights: [
      '73,000+ records across 15 years analyzed',
      'Interactive dashboards with drill-down capability',
      'Top-performing regions and crop pattern identification',
      'Presented actionable insights via clear visualizations'
    ],
    links: [{ label: 'View on GitHub', href: 'https://github.com/NILESH536/Crop-Production-Analysis', icon: 'bx bxl-github' }]
  }
];

(function initProjects() {
  const grid = $('#projectsGrid');
  if (!grid) return;

  // Render secondary project cards
  PROJECTS_DATA.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'proj-card reveal-up';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'View ' + p.title + ' on GitHub');
    card.innerHTML = `
      <div class="proj-thumb" style="background:${p.gradient}">
        <span>${p.icon}</span>
        <div class="proj-hover"><span><i class="bx bxl-github"></i> View Repository</span></div>
      </div>
      <div class="proj-body">
        <div class="proj-tags">${p.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
        <h3 class="proj-title">${p.title}</h3>
        <p class="proj-desc">${p.desc}</p>
      </div>
    `;
    // Changed: Clicking card directly opens repository
    card.addEventListener('click', () => window.open(p.links[0].href, '_blank', 'noopener'));
    card.addEventListener('keydown', e => { if (e.key==='Enter') window.open(p.links[0].href, '_blank', 'noopener'); });
    setTimeout(() => { grid.appendChild(card); card.classList.add('visible'); applyTilt(card); }, i * 120);
  });

  // EventFlow details button
  const efBtn = $('#eventflowBtn');
  if (efBtn) {
    efBtn.addEventListener('click', () => openModal({
      title:    'EventFlow – Java Event Reminder System',
      subtitle: 'Java · DevOps · CI/CD Pipeline',
      icon:     '⚡',
      gradient: 'linear-gradient(135deg, #f97316, #06b6d4)',
      tags:     ['Java','DSA','Docker','GitHub Actions','Linux','HTML','CSS','JS'],
      longDesc: 'EventFlow is a Java-based event reminder application built with DSA principles for efficient scheduling and retrieval. The project focuses heavily on DevOps automation: GitHub Actions handles the full CI pipeline (build → test → lint → artifact), Docker containerizes the application for reproducible deployments, and Linux (Ubuntu) serves as the deployment environment. A lightweight HTML/CSS/JS frontend provides the user interface. The entire process from git push to running container is fully automated.',
      highlights: [
        'Full CI/CD pipeline: push → GitHub Actions → Docker → Deploy',
        'Dockerized for consistent cross-environment deployment',
        'Java DSA core: priority queues for event scheduling',
        'Automated testing and code quality gates in CI',
        'Runs on Linux (Ubuntu) in containerized environment'
      ],
      links: [{ label: 'View on GitHub', href: 'https://github.com/NILESH536/devops-automation-platform', icon: 'bx bxl-github' }]
    }));
  }
})();

// Modal logic
const modal   = $('#projectModal');
const mClose  = $('#modalClose');

function openModal(p) {
  $('#modalHeader').style.background = p.gradient;
  $('#modalHeader').textContent      = p.icon || '';
  $('#modalTitle').textContent       = p.title;
  $('#modalDesc').textContent        = p.longDesc;
  $('#modalTags').innerHTML          = p.tags.map(t=>`<span class="tag">${t}</span>`).join('');
  $('#modalHighlights').innerHTML    = (p.highlights||[]).map(h=>
    `<div style="display:flex;align-items:flex-start;gap:.5rem;font-size:.87rem;color:var(--text-muted)">
       <i class="bx bx-check-circle" style="color:#22c55e;flex-shrink:0;margin-top:2px"></i>
       <span>${h}</span>
     </div>`).join('');
  $('#modalLinks').innerHTML = p.links.map(l=>
    `<a href="${l.href}" target="_blank" rel="noopener" class="btn btn-primary">
      <i class="${l.icon}"></i> ${l.label}
     </a>`).join('');

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => mClose.focus());
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

mClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ══════════════════════════════════════════════════════════════
   13. CONTACT FORM — Real-time validation + toast
══════════════════════════════════════════════════════════════ */
(function initContactForm() {
  const form      = $('#contactForm');
  const submitBtn = $('#submitBtn');
  const toast     = $('#toast');
  const toastMsg  = $('#toastMsg');
  const toastIcon = $('#toastIcon');
  if (!form) return;

  const rules = {
    fname:  { el: $('#fname'),  err: $('#nameErr'),  v: s => s.trim().length >= 2 ? '' : 'Name must be at least 2 characters.' },
    femail: { el: $('#femail'), err: $('#emailErr'), v: s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? '' : 'Please enter a valid email address.' },
    fmsg:   { el: $('#fmsg'),   err: $('#msgErr'),   v: s => s.trim().length >= 15 ? '' : 'Message must be at least 15 characters.' }
  };

  // Debounced real-time validation
  Object.values(rules).forEach(({ el, err, v }) => {
    el.addEventListener('input', debounce(() => {
      const msg = v(el.value);
      err.textContent = msg;
      const grp = el.closest('.form-group');
      grp.classList.toggle('has-error',   !!msg);
      grp.classList.toggle('has-success', !msg && el.value.trim() !== '');
    }, 280));
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Validate all required fields
    let valid = true;
    Object.values(rules).forEach(({ el, err, v }) => {
      const msg = v(el.value);
      err.textContent = msg;
      const grp = el.closest('.form-group');
      grp.classList.toggle('has-error',   !!msg);
      grp.classList.toggle('has-success', !msg && el.value.trim() !== '');
      if (msg) valid = false;
    });

    if (!valid) { showToast('Please fix the errors highlighted above.', true); return; }

    // Loading state
    const btnText = submitBtn.querySelector('.btn-text');
    const btnIco  = $('#btnIcon');
    submitBtn.disabled = true;
    btnText.textContent = 'Sending...';
    btnIco.className = 'bx bx-loader-alt bx-spin';

    await new Promise(r => setTimeout(r, 1600)); // simulate API

    submitBtn.disabled = false;
    btnText.textContent = 'Send Message';
    btnIco.className = 'bx bx-send';

    form.reset();
    Object.values(rules).forEach(({ el, err }) => {
      err.textContent = '';
      el.closest('.form-group').classList.remove('has-error', 'has-success');
    });

    showToast("Message sent! Nilesh will get back to you soon. 🚀");
  });

  let toastTimer;
  function showToast(msg, isErr = false) {
    toastMsg.textContent = msg;
    toastIcon.className  = isErr ? 'bx bx-error-circle toast-icon' : 'bx bx-check-circle toast-icon';
    toast.classList.toggle('is-error', isErr);
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4500);
  }
})();

/* ══════════════════════════════════════════════════════════════
   14. SMOOTH ANCHOR SCROLL
══════════════════════════════════════════════════════════════ */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const tgt = document.getElementById(id);
    if (tgt) {
      e.preventDefault();
      const navH = 70;
      window.scrollTo({ top: tgt.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
    }
  });
});

/* ══════════════════════════════════════════════════════════════
   15. LAZY LOAD images
══════════════════════════════════════════════════════════════ */
if ('IntersectionObserver' in window) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const img = e.target;
        if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
        obs.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });
  $$('img[data-src]').forEach(img => obs.observe(img));
}

// Developer Easter egg
console.log('%cNilesh Kumar – Portfolio', 'font-size:16px;font-weight:bold;color:#f97316;');
console.log('%cJava · DevOps · Data Analytics', 'color:#06b6d4;');
console.log('%cgithub.com/NILESH536', 'color:#a78bfa;');
