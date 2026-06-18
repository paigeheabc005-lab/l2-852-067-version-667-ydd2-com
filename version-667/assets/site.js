(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');

        if (toggle && panel) {
            toggle.addEventListener('click', function () {
                panel.classList.toggle('is-open');
                toggle.textContent = panel.classList.contains('is-open') ? '×' : '☰';
            });
        }

        document.querySelectorAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = './search.html';
                }
            });
        });

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var next = hero.querySelector('[data-hero-next]');
            var prev = hero.querySelector('[data-hero-prev]');
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === index);
                });
            }

            function play() {
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

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener('click', function () {
                    show(dotIndex);
                    play();
                });
            });

            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    play();
                });
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(index - 1);
                    play();
                });
            }

            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', play);
            show(0);
            play();
        }

        document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
            var input = panel.querySelector('[data-local-search]');
            var select = panel.querySelector('[data-sort-select]');
            var grid = document.querySelector('[data-card-grid]');

            if (!grid) {
                return;
            }

            var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q') || '';

            if (input && query) {
                input.value = query;
            }

            function apply() {
                var term = input ? input.value.trim().toLowerCase() : '';
                var sort = select ? select.value : 'default';
                var sorted = cards.slice();

                if (sort === 'rating') {
                    sorted.sort(function (a, b) {
                        return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
                    });
                } else if (sort === 'year') {
                    sorted.sort(function (a, b) {
                        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                    });
                } else if (sort === 'views') {
                    sorted.sort(function (a, b) {
                        return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
                    });
                } else if (sort === 'title') {
                    sorted.sort(function (a, b) {
                        return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
                    });
                } else {
                    sorted.sort(function (a, b) {
                        return cards.indexOf(a) - cards.indexOf(b);
                    });
                }

                sorted.forEach(function (card) {
                    var haystack = (card.dataset.search || '').toLowerCase();
                    var visible = !term || haystack.indexOf(term) !== -1;
                    card.style.display = visible ? '' : 'none';
                    grid.appendChild(card);
                });
            }

            if (input) {
                input.addEventListener('input', apply);
            }

            if (select) {
                select.addEventListener('change', apply);
            }

            apply();
        });
    });
})();
