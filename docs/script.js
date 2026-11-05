(() => {
  'use strict';
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const intro = $('#intro');
  const header = $('#header');
  const progress = $('#pageProgress');
  const nav = $('#navigation');
  const menu = $('#menuToggle');

  const init = () => {
    if ($('#year')) $('#year').textContent = new Date().getFullYear();
    window.setTimeout(() => intro?.classList.add('is-hidden'), reducedMotion ? 50 : 900);

    if ('IntersectionObserver' in window && !reducedMotion) {
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }, { threshold: .10, rootMargin: '0px 0px -40px 0px' });
      $$('.reveal').forEach(el => {
        const delay = Number(el.dataset.delay || 0);
        el.style.setProperty('--reveal-delay', `${Math.min(Math.max(delay,0),300)}ms`);
        observer.observe(el);
      });
    } else $$('.reveal').forEach(el => el.classList.add('is-visible'));

    const handleScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
      header.classList.toggle('is-scrolled', window.scrollY > 24);
      const ids = ['about','work','systems','contact'];
      let active = '';
      for (const id of ids) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= 150) active = id;
      }
      $$('[data-nav]').forEach(el => el.classList.toggle('is-active', el.dataset.nav === active));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    menu?.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      menu.setAttribute('aria-expanded', String(open));
    });
    $$('#navigation a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menu?.setAttribute('aria-expanded','false');
    }));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') { nav.classList.remove('is-open'); menu?.setAttribute('aria-expanded', 'false'); }
    });

    if (!reducedMotion && window.matchMedia('(pointer:fine)').matches) {
      const halo = $('#cursorHalo');
      const portrait = $('#portrait');
      document.addEventListener('pointermove', event => {
        if (halo) {
          halo.style.left = `${event.clientX}px`;
          halo.style.top = `${event.clientY}px`;
          halo.classList.add('on');
        }
      }, { passive:true });
      portrait?.addEventListener('pointermove', event => {
        const box = portrait.getBoundingClientRect();
        const x = ((event.clientX - box.left) / box.width) - .5;
        const y = ((event.clientY - box.top) / box.height) - .5;
        portrait.style.transform = `perspective(950px) rotateY(${x * 8}deg) rotateX(${-y * 7}deg)`;
      }, {passive:true});
      portrait?.addEventListener('pointerleave', () => portrait.style.transform = '');
      renderParticles();
    }
  };

  function renderParticles() {
    const canvas = $('#particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', {alpha:true});
    if (!ctx) return;
    let width = 0, height = 0, ratio = 1, tick = 0, dots = [];
    const resize = () => {
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.max(18, Math.min(50, Math.round(width / 35)));
      dots = Array.from({length:count},(_,i) => ({x:(i * 61.3 + 17) % width,y:(i * 93.7 + 43) % height,s:2 + i % 3,speed:.12 + (i % 5)*.09,rotation:i*.7,shade:i % 4 === 0}));
    };
    resize();
    window.addEventListener('resize',resize,{passive:true});
    let visible = true;
    document.addEventListener('visibilitychange',()=>{ visible = !document.hidden; });
    const draw = () => {
      window.requestAnimationFrame(draw);
      if (!visible) return;
      ctx.clearRect(0,0,width,height);
      tick += 1;
      for (const p of dots) {
        p.y -= p.speed;
        if (p.y < -8) {p.y=height+8;p.x=(p.x+193)%width;}
        ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotation + tick*.0008);
        ctx.fillStyle = p.shade ? 'rgba(245,71,80,.55)' : 'rgba(220,223,228,.38)';
        ctx.beginPath();ctx.moveTo(0,-p.s);ctx.lineTo(p.s*.8,p.s);ctx.lineTo(-p.s*.8,p.s);ctx.closePath();ctx.fill();ctx.restore();
      }
    };
    draw();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();