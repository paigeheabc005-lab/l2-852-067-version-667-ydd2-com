(function () {
  const body = document.body;
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      body.classList.toggle('menu-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    let timer = null;

    const show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(dotIndex);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  document.querySelectorAll('.js-filter').forEach(function (panel) {
    const input = panel.querySelector('[data-filter-input]');
    const year = panel.querySelector('[data-filter-year]');
    const type = panel.querySelector('[data-filter-type]');
    const list = panel.parentElement.querySelector('[data-filter-list]');
    const empty = panel.querySelector('[data-filter-empty]');
    const params = new URLSearchParams(window.location.search);

    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    const cards = list ? Array.from(list.querySelectorAll('.js-movie-card')) : [];

    const normalize = function (value) {
      return String(value || '').trim().toLowerCase();
    };

    const apply = function () {
      const term = normalize(input ? input.value : '');
      const yearValue = normalize(year ? year.value : '');
      const typeValue = normalize(type ? type.value : '');
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.keywords
        ].join(' '));
        const matchTerm = !term || haystack.includes(term);
        const matchYear = !yearValue || normalize(card.dataset.year) === yearValue;
        const matchType = !typeValue || normalize(card.dataset.type) === typeValue;
        const matched = matchTerm && matchYear && matchType;

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    };

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });

  document.querySelectorAll('.js-player').forEach(function (box) {
    const video = box.querySelector('video');
    const overlay = box.querySelector('.player-overlay');
    const stream = box.getAttribute('data-stream');
    let initialized = false;

    const load = function () {
      if (!video || !stream || initialized) {
        return;
      }
      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    };

    const play = function () {
      load();
      box.classList.add('is-playing');
      if (video) {
        const result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      }
    };

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
    }
  });
})();
