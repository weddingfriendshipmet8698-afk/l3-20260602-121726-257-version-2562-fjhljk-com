document.addEventListener("DOMContentLoaded", function () {
  setupNavigation();
  setupHeroCarousel();
  setupLocalFilters();
  setupSearchPage();
});

function setupNavigation() {
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-main-nav]");
  var search = document.querySelector(".header-search");

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", function () {
    nav.classList.toggle("is-open");
    if (search) {
      search.classList.toggle("is-open");
    }
  });
}

function setupHeroCarousel() {
  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var current = 0;

  if (slides.length <= 1) {
    return;
  }

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      show(Number(dot.getAttribute("data-hero-dot")) || 0);
    });
  });

  window.setInterval(function () {
    show(current + 1);
  }, 5200);
}

function setupLocalFilters() {
  var tools = document.querySelector("[data-list-tools]");
  var list = document.querySelector("[data-card-list]");

  if (!tools || !list) {
    return;
  }

  var input = tools.querySelector("[data-local-search]");
  var yearButtons = Array.prototype.slice.call(tools.querySelectorAll("[data-filter-year]"));
  var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
  var activeYear = "all";

  function applyFilters() {
    var keyword = input ? input.value.trim().toLowerCase() : "";

    cards.forEach(function (card) {
      var text = [
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-category"),
        card.getAttribute("data-genre"),
        card.textContent
      ].join(" ").toLowerCase();
      var year = card.getAttribute("data-year") || "";
      var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchesYear = activeYear === "all" || year.indexOf(activeYear) !== -1;

      card.style.display = matchesKeyword && matchesYear ? "" : "none";
    });
  }

  if (input) {
    input.addEventListener("input", applyFilters);
  }

  yearButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeYear = button.getAttribute("data-filter-year") || "all";
      yearButtons.forEach(function (item) {
        item.classList.toggle("active", item === button);
      });
      applyFilters();
    });
  });
}

function setupSearchPage() {
  var results = document.querySelector("[data-search-results]");
  var input = document.querySelector("[data-search-input]");
  var summary = document.querySelector("[data-search-summary]");

  if (!results || !input || !window.MOVIES) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q") || "";
  input.value = initialQuery;

  function movieCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\">",
      "  <a class=\"poster\" href=\"" + movie.detail + "\" aria-label=\"观看 " + escapeHtml(movie.title) + "\">",
      "    <img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "    <span class=\"score\">" + movie.score.toFixed(1) + "</span>",
      "  </a>",
      "  <div class=\"movie-card-body\">",
      "    <div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.category) + "</span></div>",
      "    <h3><a href=\"" + movie.detail + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p>" + escapeHtml(movie.oneLine) + "</p>",
      "    <div class=\"tag-row\">" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function runSearch() {
    var query = input.value.trim().toLowerCase();

    if (!query) {
      summary.textContent = "请输入关键词开始搜索。";
      return;
    }

    var matched = window.MOVIES.filter(function (movie) {
      return [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        movie.oneLine,
        movie.tags.join(" ")
      ].join(" ").toLowerCase().indexOf(query) !== -1;
    }).slice(0, 120);

    results.innerHTML = matched.map(movieCard).join("");
    summary.textContent = "找到 " + matched.length + " 条相关结果" + (matched.length === 120 ? "，已展示前 120 条。" : "。 ");
  }

  input.addEventListener("input", runSearch);
  runSearch();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
