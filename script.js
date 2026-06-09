    /* Hero video — ensure playback (muted autoplay) */
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) heroVideo.play().catch(() => {});

    /* Navbar */
    const navbar = document.getElementById('navbar');
    const innerPage = document.body.classList.contains('inner-page');
    const onScroll = () => navbar.classList.toggle('scrolled', innerPage || window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Hamburger */
    document.getElementById('hamburger').addEventListener('click', function () {
      const links = document.querySelector('.nav-links');
      const open = links.style.display === 'flex';
      links.style.cssText = open ? '' :
        'display:flex;flex-direction:column;position:fixed;top:62px;inset-inline:0;' +
        'background:rgba(255,255,255,.98);backdrop-filter:blur(16px);padding:26px 28px;' +
        'gap:18px;border-bottom:1px solid rgba(0,0,0,.08);box-shadow:0 8px 24px rgba(0,0,0,.08);z-index:999;';
      if (!open) document.querySelectorAll('.nav-links a').forEach(a => {
        a.style.color = '#1C1917';
        a.addEventListener('click', () => { links.style.cssText = ''; }, { once: true });
      });
    });

    /* Scroll reveal */
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal, .reveal-l, .reveal-r').forEach(el => obs.observe(el));

    /* Counters */
    function runCounter(el) {
      const target = +el.dataset.target, suffix = el.dataset.suffix || '', prefix = el.dataset.prefix || '';
      const comma = el.dataset.comma === '1', dur = 1500, t0 = performance.now();
      const fmt = new Intl.NumberFormat('en-US');
      const tick = now => {
        const p = Math.min((now - t0) / dur, 1);
        const v = Math.round((1 - Math.pow(1 - p, 3)) * target);
        el.textContent = prefix + (comma ? fmt.format(v) : v) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    const cObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { runCounter(e.target); cObs.unobserve(e.target); } });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-target]').forEach(el => cObs.observe(el));

    /* Company filter + pagination (8 per page) */
    (function () {
      const PER = 8;
      const filterBtns = document.querySelectorAll('.filter-btn');
      const grid = document.getElementById('co-grid');
      const pager = document.getElementById('co-pager');
      if (!grid || !pager) return;   /* homepage shows a trimmed, static set — no filter/pager */
      const allCards = [...document.querySelectorAll('.co-card')];
      const shuffledOrder = [...allCards].sort(() => Math.random() - .5);
      let curFilter = 'all', curPage = 1;
      const matches = c => curFilter === 'all' || c.dataset.cat === curFilter;

      function applyOrder(order) { order.forEach(c => grid.appendChild(c)); }

      function render() {
        const source = curFilter === 'all' ? shuffledOrder : allCards;
        applyOrder(source);
        const list = source.filter(matches);
        const pages = Math.max(1, Math.ceil(list.length / PER));
        if (curPage > pages) curPage = pages;
        allCards.forEach(c => c.classList.add('hide'));
        list.slice((curPage - 1) * PER, curPage * PER).forEach(c => c.classList.remove('hide'));
        pager.innerHTML = '';
        if (pages <= 1) return;
        const mk = (html, page, o = {}) => {
          const b = document.createElement('button');
          b.className = 'page-btn' + (o.active ? ' active' : '');
          b.innerHTML = html;
          if (o.disabled) b.disabled = true;
          else b.addEventListener('click', () => {
            curPage = page; render();
            document.getElementById('companies').scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
          return b;
        };
        pager.appendChild(mk('<span class="material-symbols-outlined">chevron_right</span>', curPage - 1, { disabled: curPage === 1 }));
        for (let i = 1; i <= pages; i++) pager.appendChild(mk(i, i, { active: i === curPage }));
        pager.appendChild(mk('<span class="material-symbols-outlined">chevron_left</span>', curPage + 1, { disabled: curPage === pages }));
      }
      filterBtns.forEach(btn => btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        curFilter = btn.dataset.filter; curPage = 1; render();
      }));

      /* Honor ?cat=<filter> from the URL (deep-link from the programs cards) */
      const wantCat = new URLSearchParams(location.search).get('cat');
      const wantBtn = wantCat && [...filterBtns].find(b => b.dataset.filter === wantCat);
      if (wantBtn) {
        filterBtns.forEach(b => b.classList.remove('active'));
        wantBtn.classList.add('active');
        curFilter = wantCat;
      }
      render();
    })();

    /* Testimonials slider — crossfade, autoplay, arrows + dots */
    (function () {
      const root = document.getElementById('testi');
      if (!root) return;
      const slides = [...root.querySelectorAll('.testi-slide')];
      const dotsWrap = root.querySelector('.testi-dots');
      let i = 0, timer;
      slides.forEach((_, idx) => {
        const d = document.createElement('button');
        d.className = 'testi-dot' + (idx === 0 ? ' active' : '');
        d.setAttribute('aria-label', 'עדות ' + (idx + 1));
        d.addEventListener('click', () => go(idx));
        dotsWrap.appendChild(d);
      });
      const dots = [...dotsWrap.children];
      function go(n) {
        i = (n + slides.length) % slides.length;
        slides.forEach((s, x) => s.classList.toggle('is-active', x === i));
        dots.forEach((d, x) => d.classList.toggle('active', x === i));
        start();
      }
      function start() { clearInterval(timer); timer = setInterval(() => go(i + 1), 6000); }
      root.querySelectorAll('.testi-arrow').forEach(a => a.addEventListener('click', () => go(i + (a.dataset.dir === 'next' ? 1 : -1))));
      root.addEventListener('mouseenter', () => clearInterval(timer));
      root.addEventListener('mouseleave', start);
      start();
    })();

    /* Journey progress bar (Tel Aviv → hub) — native scroll-driven, no library dependency */
    (function () {
      const journey = document.querySelector('.journey');
      if (!journey) return;
      const fill = journey.querySelector('.journey-fill');
      const train = journey.querySelector('.journey-train');
      const bg = journey.querySelector('.journey-bg');
      const setP = p => {
        const v = Math.max(0, Math.min(1, p));
        fill.style.width = (v * 100) + '%';
        train.style.right = (v * 100) + '%';
        if (bg) bg.style.transform = 'scale(1.06) translateX(' + (v * -30) + 'px)';
      };
      let ticking = false;
      const update = () => {
        ticking = false;
        const r = journey.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        // 0 when the band's top sits at 88% of the viewport, 1 once it rises to 30%
        const start = vh * 0.88, end = vh * 0.30;
        setP((start - r.top) / (start - end));
      };
      const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      window.addEventListener('load', update);
      update();
    })();

    /* News filter (internal news page) */
    (function () {
      const bar = document.querySelector('.news-filter');
      if (!bar) return;
      const cards = [...document.querySelectorAll('.news-card')];
      const btns = [...bar.querySelectorAll('.filter-btn')];
      btns.forEach(b => b.addEventListener('click', () => {
        btns.forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        const f = b.dataset.filter;
        cards.forEach(c => c.classList.toggle('hide', f !== 'all' && c.dataset.cat !== f));
      }));
    })();

    /* 0% equity reveal — GSAP */
    if (window.gsap && window.ScrollTrigger) {
      gsap.from('.diff-zero', { scale: .4, opacity: 0, rotate: -8, transformOrigin: 'center', ease: 'back.out(1.7)', duration: 1, scrollTrigger: { trigger: '#diff', start: 'top 70%' } });
      gsap.from('.diff-text > *', { y: 38, opacity: 0, duration: .7, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '#diff', start: 'top 64%' } });
    }
