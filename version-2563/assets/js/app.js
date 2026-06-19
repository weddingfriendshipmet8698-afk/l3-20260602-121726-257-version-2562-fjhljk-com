(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function bindMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function bindHeaderSearch() {
        document.querySelectorAll(".site-search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var keyword = input ? input.value.trim() : "";
                if (keyword) {
                    window.location.href = "search.html?q=" + encodeURIComponent(keyword);
                }
            });
        });
    }

    function bindHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function filterCards(input, listSelector, note) {
        var list = document.querySelector(listSelector);
        if (!input || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

        function apply() {
            var keyword = normalize(input.value);
            var matched = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-filter-text"));
                var visible = !keyword || text.indexOf(keyword) !== -1;
                card.classList.toggle("is-filtered-out", !visible);
                if (visible) {
                    matched += 1;
                }
            });
            if (note) {
                note.textContent = keyword ? "已筛选出 " + matched + " 部匹配内容。" : "输入关键词后即可筛选影片。";
            }
        }

        input.addEventListener("input", apply);
        apply();
    }

    function bindPageFilter() {
        var input = document.querySelector("[data-page-filter]");
        filterCards(input, "[data-filter-list]", null);
    }

    function bindSearchPage() {
        var input = document.querySelector("[data-search-input]");
        var note = document.querySelector("[data-search-note]");
        var clear = document.querySelector("[data-clear-search]");
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var keyword = params.get("q") || "";
        input.value = keyword;
        filterCards(input, "[data-search-list]", note);
        if (clear) {
            clear.addEventListener("click", function () {
                input.value = "";
                input.dispatchEvent(new Event("input"));
                input.focus();
            });
        }
    }

    ready(function () {
        bindMenu();
        bindHeaderSearch();
        bindHero();
        bindPageFilter();
        bindSearchPage();
    });
})();
