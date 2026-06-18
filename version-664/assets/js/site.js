(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.querySelector('.nav-menu');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    if (!slides.length) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilterGrid() {
    var grid = document.querySelector('[data-filter-grid]');
    var search = document.getElementById('categorySearch');
    var year = document.getElementById('yearFilter');
    var type = document.getElementById('typeFilter');
    if (!grid || !search) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function apply() {
      var q = normalize(search.value);
      var selectedYear = year ? normalize(year.value) : '';
      var selectedType = type ? normalize(type.value) : '';
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchText = !q || text.indexOf(q) !== -1;
        var matchYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
        var matchType = !selectedType || normalize(card.getAttribute('data-type')) === selectedType;
        card.style.display = matchText && matchYear && matchType ? '' : 'none';
      });
    }

    search.addEventListener('input', apply);
    if (year) {
      year.addEventListener('change', apply);
    }
    if (type) {
      type.addEventListener('change', apply);
    }
  }

  function createCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card">' +
      '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-year">' + escapeHtml(movie.year) + '</span>' +
      '<span class="poster-rating">★ ' + escapeHtml(movie.rating) + '</span>' +
      '<span class="poster-play">▶</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>' +
      '<p class="movie-brief">' + escapeHtml(movie.brief) + '</p>' +
      '<div class="movie-tags">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupSiteSearch() {
    var form = document.getElementById('siteSearchForm');
    var input = document.getElementById('siteSearchInput');
    var year = document.getElementById('siteSearchYear');
    var results = document.getElementById('searchPageResults');
    var movies = window.SITE_MOVIES || [];
    if (!form || !input || !results || !movies.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (initialQuery) {
      input.value = initialQuery;
    }

    function render() {
      var q = normalize(input.value);
      var selectedYear = year ? normalize(year.value) : '';
      var filtered = movies.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.genre,
          movie.tags.join(' '),
          movie.year
        ].join(' '));
        var matchText = !q || text.indexOf(q) !== -1;
        var matchYear = !selectedYear || normalize(movie.year) === selectedYear;
        return matchText && matchYear;
      }).slice(0, 120);
      results.innerHTML = filtered.map(createCard).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });
    input.addEventListener('input', render);
    if (year) {
      year.addEventListener('change', render);
    }
    if (initialQuery) {
      render();
    }
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilterGrid();
    setupSiteSearch();
  });
})();
