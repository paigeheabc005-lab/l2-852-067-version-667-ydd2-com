(function () {
    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupMobileMenu() {
        var toggle = document.querySelector('[data-mobile-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(active + 1);
            }, 6500);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                restart();
            });
        });
        show(0);
        restart();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        var params = new URLSearchParams(window.location.search);
        var queryFromUrl = params.get('q') || '';

        panels.forEach(function (panel) {
            var targetSelector = panel.getAttribute('data-target');
            var target = targetSelector ? document.querySelector(targetSelector) : null;
            if (!target) {
                return;
            }
            var cards = Array.prototype.slice.call(target.querySelectorAll('[data-title]'));
            var search = panel.querySelector('.js-search');
            var type = panel.querySelector('.js-filter-type');
            var region = panel.querySelector('.js-filter-region');
            var year = panel.querySelector('.js-filter-year');
            var count = panel.querySelector('.js-result-count');
            var noResults = document.querySelector('[data-no-results]');

            if (search && queryFromUrl) {
                search.value = queryFromUrl;
            }

            function apply() {
                var q = normalize(search && search.value);
                var selectedType = normalize(type && type.value);
                var selectedRegion = normalize(region && region.value);
                var selectedYear = normalize(year && year.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var ok = true;
                    if (q && haystack.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (selectedType && normalize(card.getAttribute('data-type')).indexOf(selectedType) === -1 && haystack.indexOf(selectedType) === -1) {
                        ok = false;
                    }
                    if (selectedRegion && normalize(card.getAttribute('data-region')).indexOf(selectedRegion) === -1) {
                        ok = false;
                    }
                    if (selectedYear && normalize(card.getAttribute('data-year')).indexOf(selectedYear) === -1) {
                        ok = false;
                    }
                    card.classList.toggle('is-hidden-by-filter', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visible);
                }
                if (noResults) {
                    noResults.classList.toggle('is-visible', visible === 0);
                }
            }

            [search, type, region, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function setupImageFallbacks() {
        var images = Array.prototype.slice.call(document.querySelectorAll('img'));
        images.forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('is-missing');
                image.removeAttribute('src');
            }, { once: true });
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-player]'));
        players.forEach(function (player) {
            var source = player.getAttribute('data-src');
            var video = player.querySelector('video');
            var start = player.querySelector('.player-start');
            var status = player.querySelector('[data-player-status]');
            var loaded = false;
            var hls = null;

            if (!source || !video || !start) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function attachSource() {
                if (loaded) {
                    return Promise.resolve();
                }
                loaded = true;
                video.controls = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    setStatus('正在使用原生 HLS 播放');
                    return Promise.resolve();
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    setStatus('HLS 播放源已加载');
                    return Promise.resolve();
                }

                setStatus('当前浏览器不支持 HLS 播放');
                return Promise.reject(new Error('HLS is not supported'));
            }

            function play() {
                start.classList.add('is-hidden');
                attachSource()
                    .then(function () {
                        return video.play();
                    })
                    .then(function () {
                        setStatus('正在播放');
                    })
                    .catch(function () {
                        start.classList.remove('is-hidden');
                        setStatus('点击后可再次尝试播放');
                    });
            }

            start.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (!loaded) {
                    play();
                }
            });
            video.addEventListener('pause', function () {
                if (loaded) {
                    setStatus('已暂停');
                }
            });
            video.addEventListener('playing', function () {
                setStatus('正在播放');
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupImageFallbacks();
        setupPlayers();
    });
})();
