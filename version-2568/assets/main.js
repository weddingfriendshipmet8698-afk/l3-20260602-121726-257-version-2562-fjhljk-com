function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initMobileMenu() {
  var button = document.querySelector("[data-mobile-menu-button]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (!button || !panel) {
    return;
  }
  button.addEventListener("click", function () {
    panel.classList.toggle("is-open");
  });
}

function initHeroCarousel() {
  var carousel = document.querySelector("[data-hero-carousel]");
  if (!carousel) {
    return;
  }
  var slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
  var dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
  var next = carousel.querySelector("[data-hero-next]");
  var prev = carousel.querySelector("[data-hero-prev]");
  var active = 0;

  function show(index) {
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === active);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === active);
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(active + 1);
    });
  }
  if (prev) {
    prev.addEventListener("click", function () {
      show(active - 1);
    });
  }
  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      show(Number(dot.dataset.heroDot || 0));
    });
  });
  if (slides.length > 1) {
    window.setInterval(function () {
      show(active + 1);
    }, 5000);
  }
}

function initStaticFilters() {
  var areas = document.querySelectorAll("[data-static-filter]");
  areas.forEach(function (area) {
    var input = area.querySelector("[data-filter-input]");
    var year = area.querySelector("[data-filter-year]");
    var list = document.querySelector("[data-filter-list]");
    if (!input || !year || !list) {
      return;
    }
    var cards = Array.from(list.querySelectorAll(".movie-card"));
    function apply() {
      var query = input.value.trim().toLowerCase();
      var selectedYear = year.value;
      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.category
        ].join(" ").toLowerCase();
        var passQuery = !query || haystack.indexOf(query) !== -1;
        var passYear = !selectedYear || card.dataset.year === selectedYear;
        card.style.display = passQuery && passYear ? "" : "none";
      });
    }
    input.addEventListener("input", apply);
    year.addEventListener("change", apply);
  });
}

function initSearchPage() {
  var page = document.querySelector("[data-search-page]");
  if (!page || !window.MOVIE_SEARCH_DATA) {
    return;
  }
  var input = page.querySelector("[data-search-input]");
  var category = page.querySelector("[data-search-category]");
  var year = page.querySelector("[data-search-year]");
  var type = page.querySelector("[data-search-type]");
  var count = page.querySelector("[data-search-count]");
  var results = page.querySelector("[data-search-results]");
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q") || "";

  if (input) {
    input.value = initialQuery;
  }

  function buildCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHTML(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a href=\"" + escapeHTML(item.url) + "\" class=\"poster-link\">" +
      "<img src=\"" + escapeHTML(item.cover) + "\" alt=\"" + escapeHTML(item.title) + "\" loading=\"lazy\" onerror=\"this.classList.add('image-missing')\" />" +
      "<span class=\"poster-shade\"></span>" +
      "<span class=\"play-chip\">播放</span>" +
      "</a>" +
      "<div class=\"card-body\">" +
      "<div class=\"card-meta\"><span>" + escapeHTML(item.year) + "</span><span>" + escapeHTML(item.region) + "</span><span>" + escapeHTML(item.type) + "</span></div>" +
      "<h3><a href=\"" + escapeHTML(item.url) + "\">" + escapeHTML(item.title) + "</a></h3>" +
      "<p>" + escapeHTML(item.summary) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function apply() {
    var query = (input && input.value ? input.value : "").trim().toLowerCase();
    var selectedCategory = category ? category.value : "";
    var selectedYear = year ? year.value : "";
    var selectedType = type ? type.value : "";
    var filtered = window.MOVIE_SEARCH_DATA.filter(function (item) {
      var haystack = [
        item.title,
        item.region,
        item.type,
        item.genre,
        item.category,
        (item.tags || []).join(" ")
      ].join(" ").toLowerCase();
      var passQuery = !query || haystack.indexOf(query) !== -1;
      var passCategory = !selectedCategory || item.category === selectedCategory;
      var passYear = !selectedYear || String(item.year) === selectedYear;
      var passType = !selectedType || item.type === selectedType;
      return passQuery && passCategory && passYear && passType;
    });
    filtered = filtered.slice(0, 240);
    if (count) {
      count.textContent = "找到 " + filtered.length + " 条结果，最多显示前 240 条。";
    }
    if (results) {
      results.innerHTML = filtered.map(buildCard).join("");
    }
  }

  [input, category, year, type].forEach(function (control) {
    if (control) {
      control.addEventListener("input", apply);
      control.addEventListener("change", apply);
    }
  });
  apply();
}

function initPlayers() {
  var cards = document.querySelectorAll("[data-player-card]");
  cards.forEach(function (card) {
    var video = card.querySelector("video[data-src]");
    var button = card.querySelector("[data-player-start]");
    if (!video || !button) {
      return;
    }

    function start() {
      var source = video.dataset.src;
      if (!source) {
        return;
      }
      button.classList.add("is-hidden");
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            button.classList.remove("is-hidden");
          });
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            button.classList.remove("is-hidden");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function () {
          video.play().catch(function () {
            button.classList.remove("is-hidden");
          });
        }, { once: true });
      } else {
        video.src = source;
        video.play().catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", start);
  });
}

ready(function () {
  initMobileMenu();
  initHeroCarousel();
  initStaticFilters();
  initSearchPage();
  initPlayers();
});
