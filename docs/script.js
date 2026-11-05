(() => {
  'use strict';
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reducedMotion) document.documentElement.classList.add('js-motion');

  const header = $('#header');
  const progress = $('#pageProgress');
  const nav = $('#navigation');
  const menu = $('#menuToggle');

  function initReveals() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window) || reducedMotion) {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {threshold:.12, rootMargin:'0px 0px -30px 0px'});
    items.forEach(el => {
      const delay = Number(el.dataset.delay || 0);
      el.style.setProperty('--reveal-delay', `${Math.max(0, Math.min(delay, 320))}ms`);
      observer.observe(el);
    });
  }

  function initScrollState() {
    const anchors = ['about','work','expertise','contact','summary','experience','skills','education'];
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
      header?.classList.toggle('is-scrolled', window.scrollY > 12);
      let active = '';
      anchors.forEach(id => {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= 150) active = id;
      });
      $$('[data-nav]').forEach(link => {
        const id = link.dataset.nav;
        link.classList.toggle('is-active', id === active);
      });
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  }

  function initMenu() {
    if (!menu || !nav) return;
    menu.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      menu.setAttribute('aria-expanded', String(open));
    });
    $$('#navigation a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menu.setAttribute('aria-expanded', 'false');
    }));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        nav.classList.remove('is-open');
        menu.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function initCursorHalo() {
    if (reducedMotion || !window.matchMedia('(pointer:fine)').matches) return;
    const halo = $('#cursorHalo');
    const portrait = $('#portrait');
    if (halo) {
      document.addEventListener('pointermove', event => {
        halo.style.left = `${event.clientX}px`;
        halo.style.top = `${event.clientY}px`;
        halo.classList.add('on');
      }, {passive:true});
    }
    if (portrait) {
      portrait.addEventListener('pointermove', event => {
        const box = portrait.getBoundingClientRect();
        const x = ((event.clientX - box.left) / box.width) - .5;
        const y = ((event.clientY - box.top) / box.height) - .5;
        portrait.style.transform = `perspective(1000px) rotateY(${x * 7}deg) rotateX(${-y * 6}deg)`;
      }, {passive:true});
      portrait.addEventListener('pointerleave', () => portrait.style.transform = '');
    }
  }

  function initMagneticButtons() {
    if (reducedMotion || !window.matchMedia('(pointer:fine)').matches) return;
    $$('.magnetic').forEach(button => {
      button.addEventListener('pointermove', event => {
        const box = button.getBoundingClientRect();
        const x = event.clientX - box.left - box.width / 2;
        const y = event.clientY - box.top - box.height / 2;
        button.style.transform = `translate(${x * 0.06}px, ${y * 0.06}px)`;
      });
      button.addEventListener('pointerleave', () => button.style.transform = '');
    });
  }

  function initResumePrint() {
    $('#printResume')?.addEventListener('click', () => window.print());
  }

  function initYear() {
    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initYear();
      initResumePrint();
      initReveals();
      initScrollState();
      initMenu();
      initCursorHalo();
      initMagneticButtons();
    }, {once:true});
  } else {
    initYear();
    initResumePrint();
    initReveals();
    initScrollState();
    initMenu();
    initCursorHalo();
    initMagneticButtons();
  }
})();
