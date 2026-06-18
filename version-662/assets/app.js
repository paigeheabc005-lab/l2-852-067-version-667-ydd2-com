(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(text) {
    return (text || '').toString().toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('open');
      document.body.classList.toggle('menu-open', isOpen);
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function setupGlobalSearch() {
    qsa('[data-global-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input', form);
        var value = input ? input.value.trim() : '';
        if (value) {
          window.location.href = 'search.html?q=' + encodeURIComponent(value);
        }
      });
    });
  }

  function setupFilters() {
    var inputs = qsa('[data-filter-input]');
    var cards = qsa('[data-filter-card]');
    var empty = qs('[data-empty-state]');
    var quickButtons = qsa('[data-quick-filter]');
    if (!inputs.length || !cards.length) {
      return;
    }

    var query = new URLSearchParams(window.location.search).get('q') || '';
    if (query) {
      inputs.forEach(function (input) {
        input.value = query;
      });
    }

    function activeQuickValue() {
      var active = quickButtons.find(function (button) {
        return button.classList.contains('is-active');
      });
      return active ? normalize(active.getAttribute('data-quick-filter')) : '';
    }

    function filterCards() {
      var text = normalize(inputs[0].value);
      var quick = activeQuickValue();
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchText = !text || haystack.indexOf(text) !== -1;
        var matchQuick = !quick || haystack.indexOf(quick) !== -1;
        var show = matchText && matchQuick;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', filterCards);
    });

    quickButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        if (button.classList.contains('is-active')) {
          button.classList.remove('is-active');
        } else {
          quickButtons.forEach(function (item) {
            item.classList.remove('is-active');
          });
          button.classList.add('is-active');
        }
        filterCards();
      });
    });

    filterCards();
  }

  function initMoviePlayer(source) {
    var video = qs('[data-player-video]');
    var overlay = qs('[data-player-overlay]');
    var startButton = qs('[data-player-start]');
    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function playVideo() {
      hideOverlay();
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    attachSource();

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }
    if (startButton) {
      startButton.addEventListener('click', playVideo);
    }

    video.addEventListener('play', hideOverlay);
  }

  window.initMoviePlayer = initMoviePlayer;

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupGlobalSearch();
    setupFilters();
  });
})();
