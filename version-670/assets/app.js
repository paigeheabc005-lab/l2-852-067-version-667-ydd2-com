(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function setupSearch() {
    var page = document.querySelector('[data-page="search"]');
    if (!page) {
      return;
    }
    var input = page.querySelector("[data-search-input]");
    var region = page.querySelector("[data-filter-region]");
    var type = page.querySelector("[data-filter-type]");
    var year = page.querySelector("[data-filter-year]");
    var state = page.querySelector("[data-search-state]");
    var cards = Array.prototype.slice.call(page.querySelectorAll(".movie-card"));
    function normalize(value) {
      return (value || "").toString().trim().toLowerCase();
    }
    function filter() {
      var keyword = normalize(input && input.value);
      var r = region ? region.value : "";
      var t = type ? type.value : "";
      var y = year ? year.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchRegion = !r || card.getAttribute("data-region") === r;
        var matchType = !t || card.getAttribute("data-type") === t;
        var matchYear = !y || card.getAttribute("data-year") === y;
        var show = matchKeyword && matchRegion && matchType && matchYear;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (state) {
        state.textContent = visible > 0 ? "筛选结果" : "暂无匹配内容";
      }
    }
    [input, region, type, year].forEach(function (el) {
      if (!el) {
        return;
      }
      el.addEventListener("input", filter);
      el.addEventListener("change", filter);
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-play]");
      var status = box.querySelector("[data-player-status]");
      var stream = box.getAttribute("data-stream");
      var hls = null;
      var loaded = false;
      if (!video || !button || !stream) {
        return;
      }
      function writeStatus(text) {
        if (status) {
          status.textContent = text || "";
        }
      }
      function begin() {
        box.classList.add("is-playing");
        if (loaded) {
          video.play().catch(function () {});
          return;
        }
        loaded = true;
        writeStatus("加载中…");
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            writeStatus("");
            video.play().catch(function () {
              box.classList.remove("is-playing");
            });
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              writeStatus("播放暂时不可用，请稍后再试");
              box.classList.remove("is-playing");
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.addEventListener("loadedmetadata", function () {
            writeStatus("");
            video.play().catch(function () {
              box.classList.remove("is-playing");
            });
          }, { once: true });
        } else {
          writeStatus("播放暂时不可用，请稍后再试");
          box.classList.remove("is-playing");
        }
      }
      button.addEventListener("click", begin);
      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          box.classList.remove("is-playing");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();
