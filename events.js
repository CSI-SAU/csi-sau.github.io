const renderGallery = (container, items, activeGroup = 'all') => {
  if (!container) return;
  container.innerHTML = '';
  const filteredItems = activeGroup === 'all' ? items : items.filter((item) => item.group === activeGroup);

  filteredItems.forEach((item, index) => {
    const figure = document.createElement('figure');
    figure.className = 'gallery-item';
    figure.style.setProperty('--gi', Math.min(index, 9));

    const img = document.createElement('img');
    img.loading = index < 3 ? 'eager' : 'lazy';
    img.src = item.src;
    img.alt = item.alt;
    img.decoding = 'async';

    figure.appendChild(img);
    container.appendChild(figure);
  });
};

const initGallerySection = (section) => {
  const galleryId = section.dataset.galleryId;
  const container = section.querySelector('.gallery-grid');
  const tabList = section.querySelector('.tab-list');

  if (!galleryId || !container) return;

  fetch('gallery-data.json')
    .then((response) => response.json())
    .then((galleryData) => {
      const items = galleryData[galleryId] || [];
      const renderCurrent = (group = 'all') => renderGallery(container, items, group);
      renderCurrent('all');

      if (!tabList) return;
      tabList.addEventListener('click', (event) => {
        const button = event.target.closest('.tab-button');
        if (!button) return;

        tabList.querySelectorAll('.tab-button').forEach((tab) => {
          tab.classList.toggle('is-active', tab === button);
        });
        renderCurrent(button.dataset.group || 'all');
      });
    })
    .catch((error) => {
      console.error('Gallery data failed to load:', error);
    });
};

const initializeGalleries = () => {
  document.querySelectorAll('.gallery-section').forEach(initGallerySection);
};

initializeGalleries();

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));

const mobileMenu = document.querySelector('.mobile-menu');
const menuButton = document.querySelector('.menu-button');
const header = document.querySelector('.site-header');

const setHeaderState = () => {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 12);
};

if (mobileMenu && menuButton) {
  menuButton.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    menuButton.classList.toggle('is-open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      menuButton.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });
}

window.addEventListener('scroll', setHeaderState, { passive: true });
setHeaderState();

/* Block board: a grid of tiny blocks that flickers like static, resolves into a
   phrase, dissolves back, and cycles through the next phrase. */
(() => {
  const canvas = document.getElementById('idea-board');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const phrases = ['BIG IDEAS', 'BOLD EXECUTION', 'MOMENTS WORTH REVISITING', 'CSI SAU'];
  const palette = ['#9bb4ff', '#8fd0ff', '#b9c9ff', '#7ea7d9', '#c9b2ff', '#ffc79a'];
  const TEXT_COLOR = '#eaf1ff';
  const ACCENT_COLOR = '#9bb4ff';
  const ROWS = 14;
  const NOISE_TIME = 1600;
  const TEXT_IN_TIME = 950;
  const HOLD_TIME = 2300;
  const OUT_TIME = 800;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let cols = 0;
  let cell = 0;
  let dpr = 1;
  let cells = [];
  let mask = null;
  let phraseIndex = 0;
  let mode = 'noise';
  let modeStart = 0;
  let lastFlicker = 0;
  let lastSpark = 0;
  let rafId = 0;
  let running = false;
  let inView = false;
  let lastFrame = 0;

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (list) => list[(Math.random() * list.length) | 0];

  const buildMask = (phrase) => {
    const S = 4;
    const W = cols * S;
    const H = ROWS * S;
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    const octx = off.getContext('2d');
    if (!octx) return new Uint8Array(cols * ROWS);
    octx.fillStyle = '#ffffff';
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    const setFont = (px) => {
      octx.font = `800 ${Math.max(1, px)}px 'Space Grotesk', 'Inter', sans-serif`;
    };
    const maxW = W * 0.92;
    const fit = (line, budget) => {
      setFont(budget);
      const w = octx.measureText(line).width;
      return w > maxW ? budget * (maxW / w) : budget;
    };
    const words = phrase.split(' ');
    let twoLine = null;
    if (words.length > 1) {
      for (let i = 1; i < words.length; i++) {
        const a = words.slice(0, i).join(' ');
        const b = words.slice(i).join(' ');
        const f = Math.min(fit(a, H / 2), fit(b, H / 2));
        if (!twoLine || f > twoLine.f) twoLine = { lines: [a, b], f };
      }
    }
    const singleFit = fit(phrase, H * 0.8);
    let lines;
    let fontPx;
    let lineH;
    if (twoLine && twoLine.f > singleFit * 1.15) {
      lines = twoLine.lines;
      fontPx = Math.min(twoLine.f, (H / 2) * 0.94);
      lineH = H / 2;
    } else {
      lines = [phrase];
      fontPx = singleFit;
      lineH = H;
    }
    setFont(fontPx);
    lines.forEach((line, i) => {
      const y = H / 2 + (i - (lines.length - 1) / 2) * lineH;
      octx.fillText(line, W / 2, y);
    });
    const data = octx.getImageData(0, 0, W, H).data;
    const m = new Uint8Array(cols * ROWS);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < cols; c++) {
        let sum = 0;
        for (let sy = 0; sy < S; sy++) {
          const rowOff = (r * S + sy) * W;
          for (let sx = 0; sx < S; sx++) sum += data[((rowOff + c * S + sx) << 2) + 3];
        }
        m[r * cols + c] = sum / (S * S * 255) > 0.3 ? 1 : 0;
      }
    }
    return m;
  };

  const setTarget = (i, target, color, delay) => {
    const c = cells[i];
    if (!c) return;
    c.target = target;
    c.color = color;
    c.delay = delay;
  };

  const enterNoise = (now) => {
    mode = 'noise';
    modeStart = now;
    for (let i = 0; i < cells.length; i++) {
      if (Math.random() < 0.1) setTarget(i, rand(0.12, 0.45), pick(palette), rand(0, 420));
      else setTarget(i, 0, null, rand(0, 420));
    }
    lastFlicker = now;
  };

  const enterText = (now) => {
    mask = buildMask(phrases[phraseIndex]);
    let lit = 0;
    for (let i = 0; i < mask.length; i++) lit += mask[i];
    if (!lit) {
      enterNoise(now);
      return;
    }
    mode = 'text';
    modeStart = now;
    for (let i = 0; i < cells.length; i++) {
      const delay = rand(0, 550);
      if (mask[i]) setTarget(i, rand(0.93, 1), Math.random() < 0.07 ? ACCENT_COLOR : TEXT_COLOR, delay);
      else setTarget(i, 0, null, delay);
    }
    lastSpark = now;
  };

  const enterOut = (now) => {
    mode = 'out';
    modeStart = now;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    for (let i = 0; i < cells.length; i++) {
      const flash = Math.random() < 0.05;
      setTarget(i, flash ? rand(0.1, 0.3) : 0, flash ? pick(palette) : null, rand(0, 380));
    }
  };

  const sizeBoard = () => {
    const cssWidth = Math.max(200, canvas.clientWidth || 320);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cols = Math.max(30, Math.min(130, Math.round(cssWidth / 7.5)));
    cell = cssWidth / cols;
    width = cssWidth;
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(ROWS * cell * dpr);
    canvas.style.height = `${ROWS * cell}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cells = [];
    for (let i = 0; i < cols * ROWS; i++) cells.push({ b: 0, target: 0, delay: 0, color: null });
  };

  const frame = (now) => {
    rafId = requestAnimationFrame(frame);
    const dt = Math.min((now - lastFrame) || 16, 64);
    lastFrame = now;

    if (mode === 'noise' && now - modeStart > NOISE_TIME) enterText(now);
    else if (mode === 'text' && now - modeStart > TEXT_IN_TIME + HOLD_TIME) enterOut(now);
    else if (mode === 'out' && now - modeStart > OUT_TIME + 500) enterNoise(now);

    if (mode === 'noise' && now - lastFlicker > 130) {
      lastFlicker = now;
      const flips = Math.max(6, Math.round(cells.length * 0.025));
      for (let n = 0; n < flips; n++) {
        const i = (Math.random() * cells.length) | 0;
        if (Math.random() < 0.5) setTarget(i, rand(0.1, 0.42), pick(palette), rand(0, 110));
        else setTarget(i, 0, null, rand(0, 110));
      }
    }

    if (mode === 'text' && mask && now - lastSpark > 520) {
      lastSpark = now;
      for (let n = 0; n < 5; n++) {
        const i = (Math.random() * cells.length) | 0;
        if (!mask[i]) setTarget(i, Math.random() < 0.5 ? rand(0.04, 0.09) : 0, pick(palette), rand(0, 160));
      }
    }

    const k = 1 - Math.exp(-dt / 120);
    const inset = Math.max(1, cell * 0.1);
    const size = cell - inset * 2;

    ctx.clearRect(0, 0, width, ROWS * cell);
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i];
      if (c.delay > 0) {
        c.delay -= dt;
      } else if (Math.abs(c.target - c.b) > 0.004) {
        c.b += (c.target - c.b) * k;
      } else {
        c.b = c.target;
      }
      if (c.b <= 0.02) continue;
      const col = i % cols;
      const row = (i / cols) | 0;
      ctx.globalAlpha = Math.min(1, c.b);
      ctx.fillStyle = c.color || TEXT_COLOR;
      ctx.fillRect(col * cell + inset, row * cell + inset, size, size);
    }
    ctx.globalAlpha = 1;
  };

  const drawStatic = () => {
    mask = buildMask(phrases[0]);
    const inset = Math.max(1, cell * 0.12);
    ctx.clearRect(0, 0, width, ROWS * cell);
    ctx.fillStyle = TEXT_COLOR;
    ctx.globalAlpha = 0.92;
    for (let i = 0; i < mask.length; i++) {
      if (!mask[i]) continue;
      const col = i % cols;
      const row = (i / cols) | 0;
      ctx.fillRect(col * cell + inset, row * cell + inset, cell - inset * 2, cell - inset * 2);
    }
    ctx.globalAlpha = 1;
  };

  const start = () => {
    if (running) return;
    running = true;
    lastFrame = performance.now();
    rafId = requestAnimationFrame(frame);
  };
  const stop = () => {
    if (!running) return;
    running = false;
    cancelAnimationFrame(rafId);
  };
  const sync = () => {
    if (inView && !document.hidden) start();
    else stop();
  };

  sizeBoard();

  if (reduced) {
    drawStatic();
    window.addEventListener('resize', () => {
      sizeBoard();
      drawStatic();
    });
    return;
  }

  const io = new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    sync();
  }, { rootMargin: '80px' });
  io.observe(canvas);
  document.addEventListener('visibilitychange', sync);

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const cssWidth = Math.max(200, canvas.clientWidth || 320);
      if (Math.abs(cssWidth - width) < 40) return;
      sizeBoard();
      phraseIndex = 0;
      enterNoise(performance.now());
    }, 160);
  });

  let booted = false;
  const boot = () => {
    if (booted) return;
    booted = true;
    enterNoise(performance.now());
    sync();
  };
  if (document.fonts && document.fonts.load) {
    document.fonts.load("800 16px 'Space Grotesk'").then(boot).catch(boot);
    setTimeout(boot, 1200);
  } else {
    boot();
  }
})();
