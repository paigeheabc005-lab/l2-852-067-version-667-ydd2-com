(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');
  var searchButton = document.querySelector('.search-toggle');
  var searchPanel = document.querySelector('.search-panel');
  var searchClose = document.querySelector('.search-close');
  var searchInput = document.getElementById('site-search');
  var searchResults = document.getElementById('search-results');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));

  function setHidden(element, hidden) {
    if (!element) {
      return;
    }
    element.hidden = hidden;
  }

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var willOpen = mobilePanel.hidden;
      setHidden(mobilePanel, !willOpen);
      document.body.classList.toggle('menu-open', willOpen);
    });
  }

  function openSearch() {
    if (!searchPanel) {
      return;
    }
    setHidden(searchPanel, false);
    document.body.classList.add('search-open');
    if (searchInput) {
      window.setTimeout(function () {
        searchInput.focus();
      }, 40);
    }
  }

  function closeSearch() {
    if (!searchPanel) {
      return;
    }
    setHidden(searchPanel, true);
    document.body.classList.remove('search-open');
  }

  if (searchButton) {
    searchButton.addEventListener('click', openSearch);
  }

  if (searchClose) {
    searchClose.addEventListener('click', closeSearch);
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeSearch();
      if (mobilePanel && !mobilePanel.hidden) {
        setHidden(mobilePanel, true);
        document.body.classList.remove('menu-open');
      }
    }
  });

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    var next = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === next);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === next);
    });
    currentSlide = next;
  }

  var currentSlide = 0;
  if (slides.length) {
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 6200);
  }

  function createResult(movie) {
    var link = document.createElement('a');
    link.className = 'search-result';
    link.href = movie.url;

    var img = document.createElement('img');
    img.src = movie.image;
    img.alt = movie.title;
    link.appendChild(img);

    var content = document.createElement('div');
    var title = document.createElement('strong');
    title.textContent = movie.title;
    content.appendChild(title);

    var meta = document.createElement('small');
    meta.textContent = movie.year + ' · ' + movie.region + ' · ' + movie.type;
    content.appendChild(meta);

    var text = document.createElement('p');
    text.textContent = movie.line;
    content.appendChild(text);

    link.appendChild(content);
    return link;
  }

  function renderSearch(query) {
    if (!searchResults) {
      return;
    }
    searchResults.innerHTML = '';
    var keyword = query.trim().toLowerCase();
    if (!keyword) {
      return;
    }
    var source = window.SITE_MOVIES || [];
    var matched = source.filter(function (movie) {
      return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags, movie.line]
        .join(' ')
        .toLowerCase()
        .indexOf(keyword) >= 0;
    }).slice(0, 24);

    matched.forEach(function (movie) {
      searchResults.appendChild(createResult(movie));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });
  }

  function initPlayer() {
    var shell = document.querySelector('.video-shell');
    var video = document.getElementById('movie-player');
    var button = document.querySelector('.player-start');
    if (!shell || !video) {
      return;
    }

    var stream = shell.getAttribute('data-stream');
    var ready = false;
    var hls = null;

    function attach() {
      if (ready || !stream) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        ready = true;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
        ready = true;
      } else {
        video.src = stream;
        ready = true;
      }
    }

    function play() {
      attach();
      shell.classList.add('playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('playing');
        });
      }
    }

    shell.addEventListener('click', function (event) {
      if (event.target === video && !video.paused) {
        return;
      }
      play();
    });

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });
    }

    video.addEventListener('play', function () {
      shell.classList.add('playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        shell.classList.remove('playing');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  initPlayer();
})();
