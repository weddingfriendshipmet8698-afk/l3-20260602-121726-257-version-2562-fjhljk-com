(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHTML(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMobileMenu() {
        var button = qs("[data-menu-button]");
        var nav = qs("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = qs("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = qsa("[data-hero-slide]", hero);
        var dots = qsa("[data-hero-dot]", hero);
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer;

        function activate(nextIndex) {
            index = nextIndex;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                activate((index + 1) % slides.length);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                activate(i);
                start();
            });
        });

        activate(0);
        start();
    }

    function setupFilters() {
        qsa("[data-filter-root]").forEach(function (root) {
            var input = qs("[data-filter-text]", root);
            var region = qs("[data-filter-region]", root);
            var year = qs("[data-filter-year]", root);
            var clear = qs("[data-clear-filter]", root);
            var grid = qs("[data-filter-grid]", root.ownerDocument);
            var empty = qs("[data-filter-empty]", root.ownerDocument);
            if (!grid) {
                return;
            }
            var cards = qsa("[data-filter-item]", grid);

            function apply() {
                var text = normalize(input && input.value);
                var regionValue = normalize(region && region.value);
                var yearValue = normalize(year && year.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-summary")
                    ].join(" "));
                    var cardRegion = normalize(card.getAttribute("data-region"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var ok = true;
                    if (text && haystack.indexOf(text) === -1) {
                        ok = false;
                    }
                    if (regionValue && cardRegion !== regionValue) {
                        ok = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, region, year].forEach(function (el) {
                if (el) {
                    el.addEventListener("input", apply);
                    el.addEventListener("change", apply);
                }
            });

            if (clear) {
                clear.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    if (region) {
                        region.value = "";
                    }
                    if (year) {
                        year.value = "";
                    }
                    apply();
                });
            }

            apply();
        });
    }

    function createSearchCard(item) {
        return [
            '<article class="movie-card">',
            '<a class="poster-link" href="' + escapeHTML(item.url) + '">',
            '<img src="' + escapeHTML(item.cover) + '" alt="' + escapeHTML(item.title) + '在线观看" loading="lazy">',
            '<span class="poster-year">' + escapeHTML(item.year) + '</span>',
            '<span class="poster-play">▶</span>',
            '</a>',
            '<div class="card-body">',
            '<div class="card-tags"><span>' + escapeHTML(item.region) + '</span><span>' + escapeHTML(item.category) + '</span></div>',
            '<h3><a href="' + escapeHTML(item.url) + '">' + escapeHTML(item.title) + '</a></h3>',
            '<p class="card-desc">' + escapeHTML(item.desc) + '</p>',
            '<div class="card-foot"><span>' + escapeHTML(item.genre) + '</span><span class="card-score">★ ' + escapeHTML(item.rating) + '</span></div>',
            '</div>',
            '</article>'
        ].join("");
    }

    function setupSearchPage() {
        var root = qs("[data-search-page]");
        if (!root || !window.searchItems) {
            return;
        }
        var input = qs("[data-search-input]", root);
        var region = qs("[data-search-region]", root);
        var category = qs("[data-search-category]", root);
        var clear = qs("[data-search-clear]", root);
        var grid = qs("[data-search-results]", root);
        var empty = qs("[data-search-empty]", root);
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || params.get("search") || "";
        if (input) {
            input.value = initial;
        }

        function render() {
            var text = normalize(input && input.value);
            var regionValue = normalize(region && region.value);
            var categoryValue = normalize(category && category.value);
            var results = window.searchItems.filter(function (item) {
                var haystack = normalize([item.title, item.region, item.genre, item.category, item.tags, item.desc].join(" "));
                if (text && haystack.indexOf(text) === -1) {
                    return false;
                }
                if (regionValue && normalize(item.region) !== regionValue) {
                    return false;
                }
                if (categoryValue && normalize(item.category) !== categoryValue) {
                    return false;
                }
                return true;
            }).slice(0, 96);
            grid.innerHTML = results.map(createSearchCard).join("");
            if (empty) {
                empty.classList.toggle("is-visible", results.length === 0);
            }
        }

        [input, region, category].forEach(function (el) {
            if (el) {
                el.addEventListener("input", render);
                el.addEventListener("change", render);
            }
        });

        if (clear) {
            clear.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                if (region) {
                    region.value = "";
                }
                if (category) {
                    category.value = "";
                }
                render();
            });
        }

        render();
    }

    window.initMoviePlayer = function (videoId, buttonId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !button || !source) {
            return;
        }
        var attached = false;
        var hls = null;

        function playVideo() {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        function attachSource() {
            if (attached) {
                playVideo();
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                attached = true;
                playVideo();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                attached = true;
                return;
            }
            video.src = source;
            attached = true;
            playVideo();
        }

        function start() {
            button.classList.add("is-hidden");
            attachSource();
        }

        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
})();
