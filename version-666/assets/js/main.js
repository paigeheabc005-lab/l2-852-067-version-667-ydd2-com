(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initMobileNav() {
    var button = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initSorting() {
    document.querySelectorAll('[data-sort-group]').forEach(function (group) {
      var grid = group.parentElement.querySelector('[data-sortable-grid]');
      var buttons = Array.prototype.slice.call(group.querySelectorAll('[data-sort]'));
      if (!grid || !buttons.length) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.children);
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          var mode = button.getAttribute('data-sort');
          buttons.forEach(function (item) {
            item.classList.toggle('active', item === button);
          });
          var sorted = cards.slice().sort(function (a, b) {
            if (mode === 'year') {
              return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
            }
            if (mode === 'title') {
              return a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'), 'zh-Hans-CN');
            }
            return Number(a.getAttribute('data-order')) - Number(b.getAttribute('data-order'));
          });
          sorted.forEach(function (card) {
            grid.appendChild(card);
          });
        });
      });
    });
  }

  function setupPlayer(video) {
    var streamUrl = video.getAttribute('data-stream-url');
    if (!streamUrl) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video._hls = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else {
      video.src = streamUrl;
    }
    var shell = video.closest('.player-shell');
    var overlay = shell ? shell.querySelector('.player-overlay') : null;
    if (!overlay) {
      return;
    }
    function playVideo() {
      overlay.classList.add('is-hidden');
      var playResult = video.play();
      if (playResult && playResult.catch) {
        playResult.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }
    overlay.addEventListener('click', playVideo);
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
  }

  function initPlayers() {
    document.querySelectorAll('.movie-player[data-stream-url]').forEach(setupPlayer);
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function renderSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-order="' + escapeHtml(movie.id) + '">' +
      '<a class="poster-link" href="' + escapeHtml(movie.detailUrl) + '" aria-label="' + escapeHtml(movie.title) + '">' +
      '<div class="poster-frame">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" class="poster-img" loading="lazy" onerror="this.remove()">' +
      '<span class="badge badge-cyan">' + escapeHtml(movie.category) + '</span>' +
      '<span class="poster-year">' + escapeHtml(movie.year || '精选') + '</span>' +
      '<span class="poster-play">▶</span>' +
      '</div>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<h3><a href="' + escapeHtml(movie.detailUrl) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.description) + '</p>' +
      '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function initSearchPage() {
    var page = document.querySelector('[data-search-page]');
    if (!page || !window.SEARCH_INDEX) {
      return;
    }
    var form = page.querySelector('[data-search-form]');
    var input = form ? form.querySelector('input[name="q"]') : null;
    var results = page.querySelector('[data-search-results]');
    var status = page.querySelector('[data-search-status]');
    if (!form || !input || !results || !status) {
      return;
    }

    function search(value) {
      var query = String(value || '').trim().toLowerCase();
      if (!query) {
        status.textContent = '热门推荐';
        results.innerHTML = window.SEARCH_INDEX.slice(0, 12).map(renderSearchCard).join('');
        return;
      }
      var matched = window.SEARCH_INDEX.filter(function (movie) {
        return String(movie.text || '').toLowerCase().indexOf(query) !== -1;
      });
      status.textContent = '找到 ' + matched.length + ' 个相关结果：' + query;
      results.innerHTML = matched.slice(0, 120).map(renderSearchCard).join('');
      if (!matched.length) {
        results.innerHTML = '<div class="empty-state">未找到相关内容</div>';
      }
    }

    input.value = getQueryValue('q');
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set('q', input.value.trim());
      window.history.replaceState({}, '', nextUrl.toString());
      search(input.value);
    });
    search(input.value);
  }

  ready(function () {
    initMobileNav();
    initHero();
    initSorting();
    initPlayers();
    initSearchPage();
  });
})();
