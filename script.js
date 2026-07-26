/**
 * ACHITOR — site interactions
 * Progressive enhancement only: every effect here layers on top of markup
 * and CSS that already work without it. Respects prefers-reduced-motion.
 */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const raf = window.requestAnimationFrame;

  /** Throttle a handler to at most once per animation frame. */
  function rafThrottle(fn) {
    let ticking = false;
    return (...args) => {
      if (ticking) return;
      ticking = true;
      raf(() => {
        fn(...args);
        ticking = false;
      });
    };
  }

  /* ----------------------------------------------------------------
     Scroll progress bar
  ---------------------------------------------------------------- */
  function initProgress(onScrollCallbacks) {
    const bar = document.querySelector('[data-progress]');
    if (!bar) return;
    onScrollCallbacks.push(() => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const y = window.scrollY || window.pageYOffset;
      bar.style.width = Math.min(100, (y / max) * 100) + '%';
    });
  }

  /* ----------------------------------------------------------------
     Header background state on scroll
  ---------------------------------------------------------------- */
  function initNav(onScrollCallbacks) {
    const nav = document.querySelector('[data-nav]');
    if (!nav) return;
    onScrollCallbacks.push(() => {
      nav.classList.toggle('is-scrolled', (window.scrollY || window.pageYOffset) > 40);
    });
  }

  /* ----------------------------------------------------------------
     Parallax drift on project media + hero floaters
  ---------------------------------------------------------------- */
  function initParallax(onScrollCallbacks) {
    if (reduceMotion) return;
    const parallax = Array.from(document.querySelectorAll('[data-parallax]'));
    const floaters = Array.from(document.querySelectorAll('[data-float]'));
    if (!parallax.length && !floaters.length) return;

    const vh = () => window.innerHeight;

    onScrollCallbacks.push(() => {
      const viewportHeight = vh();
      parallax.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > viewportHeight + 200) return;
        const progress = (r.top + r.height / 2 - viewportHeight / 2) / viewportHeight;
        el.style.transform = 'translate3d(0,' + (-progress * 26).toFixed(2) + 'px,0)';
      });
      floaters.forEach((el) => {
        const r = el.getBoundingClientRect();
        const progress = (r.top + r.height / 2 - viewportHeight / 2) / viewportHeight;
        el.style.transform = 'translate3d(0,' + (-progress * 18).toFixed(2) + 'px,0)';
      });
    });
  }

  /* ----------------------------------------------------------------
     Single shared scroll listener
  ---------------------------------------------------------------- */
  function bindScroll(callbacks) {
    if (!callbacks.length) return;
    const run = () => callbacks.forEach((fn) => fn());
    const onScroll = rafThrottle(run);
    window.addEventListener('scroll', onScroll, { passive: true });
    run();
  }

  /* ----------------------------------------------------------------
     Scroll-triggered reveals ([data-reveal], [data-stagger])
  ---------------------------------------------------------------- */
  function initReveal() {
    const targets = Array.from(document.querySelectorAll('[data-reveal], [data-stagger], [data-media-reveal]'));
    if (!targets.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.1 }
    );

    targets.forEach((el) => {
      // Anything already in view on load (e.g. above-the-fold) shows immediately.
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9) {
        el.classList.add('is-visible');
        return;
      }
      io.observe(el);
    });

    // Safety net: never leave content permanently hidden.
    setTimeout(() => targets.forEach((el) => el.classList.add('is-visible')), 4000);
  }

  /* ----------------------------------------------------------------
     Hero entrance (always plays on load, not scroll-gated)
  ---------------------------------------------------------------- */
  function initHeroEntrance() {
    const els = Array.from(document.querySelectorAll('[data-hero]'));
    if (!els.length) return;

    if (reduceMotion) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    raf(() => raf(() => els.forEach((el) => el.classList.add('is-visible'))));
  }

  /* ----------------------------------------------------------------
     Process timeline: progress fill + dot colour reveal
  ---------------------------------------------------------------- */
  function initProcess() {
    const wrap = document.querySelector('.process-wrap');
    const grid = document.querySelector('[data-process-grid]');
    if (!wrap) return;

    const activate = () => wrap.classList.add('is-active');

    if (reduceMotion || !('IntersectionObserver' in window)) {
      activate();
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              activate();
              io.disconnect();
            }
          });
        },
        { threshold: 0.25 }
      );
      io.observe(wrap);
    }

    if (!grid) return;
    const syncLayout = () => {
      const steps = Array.from(grid.children);
      const wrapped = steps.length > 1 && steps.some((step) => step.offsetTop > steps[0].offsetTop + 4);
      wrap.classList.toggle('is-wrapped', wrapped);
    };
    syncLayout();
    window.addEventListener('resize', rafThrottle(syncLayout), { passive: true });
  }

  /* ----------------------------------------------------------------
     Hero spotlight that follows the cursor
  ---------------------------------------------------------------- */
  function initSpotlight() {
    if (!finePointer || reduceMotion) return;
    const host = document.querySelector('[data-spot]');
    const light = document.querySelector('[data-spot-light]');
    if (!host || !light) return;

    host.addEventListener('pointermove', (e) => {
      const r = host.getBoundingClientRect();
      light.style.setProperty('--x', e.clientX - r.left + 'px');
      light.style.setProperty('--y', e.clientY - r.top + 'px');
      light.classList.add('is-active');
    });
    host.addEventListener('pointerleave', () => light.classList.remove('is-active'));
  }

  /* ----------------------------------------------------------------
     Magnetic buttons ([data-magnet])
  ---------------------------------------------------------------- */
  function initMagnetButtons() {
    if (!finePointer || reduceMotion) return;
    document.querySelectorAll('[data-magnet]').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.classList.add('is-magnet-active');
        btn.style.setProperty('--mx', (dx * 12).toFixed(1) + 'px');
        btn.style.setProperty('--my', (dy * 8 - 2).toFixed(1) + 'px');
      });
      btn.addEventListener('pointerleave', () => {
        btn.classList.remove('is-magnet-active');
        btn.style.setProperty('--mx', '0px');
        btn.style.setProperty('--my', '0px');
      });
    });
  }

  /* ----------------------------------------------------------------
     3D tilt on project browser frames ([data-tilt])
  ---------------------------------------------------------------- */
  function initTilt() {
    if (!finePointer || reduceMotion) return;
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        card.classList.add('is-tilting');
        card.style.setProperty('--ry', (dx * 5).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (-dy * 4).toFixed(2) + 'deg');
        card.style.setProperty('--tilt-scale', '1.012');
      });
      card.addEventListener('pointerleave', () => {
        card.classList.remove('is-tilting');
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--tilt-scale', '1');
      });
    });
  }

  /* ----------------------------------------------------------------
     Service card cursor-tracked glow ([data-glow-card])
  ---------------------------------------------------------------- */
  function initServiceGlow() {
    if (!finePointer || reduceMotion) return;
    document.querySelectorAll('[data-glow-card]').forEach((card) => {
      const glow = card.querySelector('.service-card__glow');
      if (!glow) return;
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        glow.style.setProperty('--mx', e.clientX - r.left + 'px');
        glow.style.setProperty('--my', e.clientY - r.top + 'px');
      });
    });
  }

  /* ----------------------------------------------------------------
     Custom cursor (dot + trailing ring), desktop fine-pointer only
  ---------------------------------------------------------------- */
  function initCustomCursor() {
    if (!finePointer || reduceMotion) return;

    const root = document.documentElement;
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);
    root.classList.add('has-custom-cursor');

    let targetX = 0;
    let targetY = 0;
    let ringX = 0;
    let ringY = 0;
    let seeded = false;

    const hoverSelector = 'a, button, [data-tilt], [data-glow-card]';

    document.addEventListener('pointermove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      dot.style.setProperty('--x', targetX + 'px');
      dot.style.setProperty('--y', targetY + 'px');
      if (!seeded) {
        ringX = targetX;
        ringY = targetY;
        ring.style.setProperty('--x', ringX + 'px');
        ring.style.setProperty('--y', ringY + 'px');
        seeded = true;
      }
      dot.classList.add('is-active');
      ring.classList.add('is-active');
    });

    document.addEventListener('pointerover', (e) => {
      if (e.target.closest && e.target.closest(hoverSelector)) root.classList.add('cursor-hover');
    });
    document.addEventListener('pointerout', (e) => {
      if (e.target.closest && e.target.closest(hoverSelector)) root.classList.remove('cursor-hover');
    });
    document.addEventListener('mouseleave', () => {
      dot.classList.remove('is-active');
      ring.classList.remove('is-active');
    });

    const follow = () => {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      ring.style.setProperty('--x', ringX.toFixed(1) + 'px');
      ring.style.setProperty('--y', ringY.toFixed(1) + 'px');
      raf(follow);
    };
    raf(follow);
  }

  /* ----------------------------------------------------------------
     Soft fade transition between internal pages
  ---------------------------------------------------------------- */
  function initPageTransitions() {
    if (reduceMotion) return;
    const links = document.querySelectorAll('a[href="index.html"], a[href="contact.html"]');
    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        if (e.defaultPrevented || e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (link.target === '_blank') return;

        e.preventDefault();
        document.body.classList.add('is-leaving');
        setTimeout(() => {
          window.location.href = link.href;
        }, 320);
      });
    });
  }

  /* ----------------------------------------------------------------
     Back-to-top button with scroll-progress ring
  ---------------------------------------------------------------- */
  function initBackToTop(onScrollCallbacks) {
    const btn = document.querySelector('[data-back-to-top]');
    if (!btn) return;

    onScrollCallbacks.push(() => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const y = window.scrollY || window.pageYOffset;
      btn.style.setProperty('--progress', Math.min(1, y / max).toFixed(3));
      btn.classList.toggle('is-visible', y > window.innerHeight * 0.6);
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ----------------------------------------------------------------
     Boot
  ---------------------------------------------------------------- */
  function init() {
    const onScrollCallbacks = [];
    initProgress(onScrollCallbacks);
    initNav(onScrollCallbacks);
    initParallax(onScrollCallbacks);
    initBackToTop(onScrollCallbacks);
    bindScroll(onScrollCallbacks);

    initReveal();
    initHeroEntrance();
    initProcess();
    initSpotlight();
    initMagnetButtons();
    initTilt();
    initServiceGlow();
    initCustomCursor();
    initPageTransitions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
