document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.from(hero.querySelectorAll(".hero-slide"));
    var dots = Array.from(hero.querySelectorAll(".hero-dot"));
    var current = 0;
    var apply = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    };
    var next = function () {
      apply(current + 1);
    };
    var timer = window.setInterval(next, 5200);
    var prevBtn = hero.querySelector("[data-hero-prev]");
    var nextBtn = hero.querySelector("[data-hero-next]");
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        window.clearInterval(timer);
        apply(current - 1);
        timer = window.setInterval(next, 5200);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        window.clearInterval(timer);
        apply(current + 1);
        timer = window.setInterval(next, 5200);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        apply(Number(dot.getAttribute("data-hero-dot")) || 0);
        timer = window.setInterval(next, 5200);
      });
    });
  }

  var filterInput = document.querySelector(".movie-filter");
  var grid = document.querySelector("[data-filter-grid]");
  var sortSelect = document.querySelector(".sort-select");
  var filterCards = function () {
    if (!grid) {
      return;
    }
    var q = filterInput ? filterInput.value.trim().toLowerCase() : "";
    Array.from(grid.children).forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-year") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-type") || "",
        card.textContent || ""
      ].join(" ").toLowerCase();
      card.style.display = haystack.indexOf(q) >= 0 ? "" : "none";
    });
  };
  var sortCards = function () {
    if (!grid || !sortSelect) {
      return;
    }
    var mode = sortSelect.value;
    if (mode === "default") {
      return;
    }
    var cards = Array.from(grid.children);
    cards.sort(function (a, b) {
      if (mode === "year-asc") {
        return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
      }
      if (mode === "title") {
        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
      }
      return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
    });
    cards.forEach(function (card) {
      grid.appendChild(card);
    });
    filterCards();
  };
  if (filterInput) {
    filterInput.addEventListener("input", filterCards);
  }
  if (sortSelect) {
    sortSelect.addEventListener("change", sortCards);
  }

  var searchResults = document.getElementById("search-results");
  if (searchResults && Array.isArray(window.MOVIE_SEARCH_DATA)) {
    var searchInput = document.getElementById("search-input");
    var categoryFilter = document.getElementById("category-filter");
    var yearSort = document.getElementById("year-sort");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (searchInput) {
      searchInput.value = initial;
    }
    var render = function () {
      var q = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var cat = categoryFilter ? categoryFilter.value : "";
      var mode = yearSort ? yearSort.value : "year-desc";
      var items = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.category].join(" ").toLowerCase();
        return (!q || text.indexOf(q) >= 0) && (!cat || movie.categorySlug === cat);
      });
      items.sort(function (a, b) {
        if (mode === "year-asc") {
          return a.year - b.year;
        }
        if (mode === "title") {
          return a.title.localeCompare(b.title, "zh-Hans-CN");
        }
        return b.year - a.year;
      });
      searchResults.innerHTML = items.map(function (movie) {
        return '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-year="' + movie.year + '">' +
          '<a class="poster-link" href="./movies/' + movie.file + '">' +
          '<img src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="poster-mask">立即观看</span>' +
          '</a>' +
          '<div class="movie-card-body">' +
          '<div class="movie-meta-line"><span>' + movie.year + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
          '<h3><a href="./movies/' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="tag-row"><span>' + escapeHtml(movie.category) + '</span></div>' +
          '</div>' +
          '</article>';
      }).join("");
    };
    var escapeHtml = function (value) {
      return String(value || "").replace(/[&<>"]/g, function (char) {
        return {"&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;"}[char];
      });
    };
    [searchInput, categoryFilter, yearSort].forEach(function (el) {
      if (el) {
        el.addEventListener("input", render);
        el.addEventListener("change", render);
      }
    });
    render();
  }
});
