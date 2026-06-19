(function () {
  function all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = document.querySelector(".mobile-menu-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = all(".hero-slide", slider);
    var dots = all(".hero-dot", slider);
    var thumbs = all(".hero-thumb", slider);
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
      thumbs.forEach(function (thumb, itemIndex) {
        thumb.classList.toggle("is-active", itemIndex === index);
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

    dots.concat(thumbs).forEach(function (control) {
      control.addEventListener("click", function () {
        show(Number(control.getAttribute("data-slide-target")) || 0);
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

  function applyFilters(scope) {
    var input = scope.querySelector(".filter-search");
    var selects = all(".filter-select", scope);
    var cards = all(".movie-card", scope);
    var empty = scope.querySelector(".empty-state");
    var query = normalize(input ? input.value : "");
    var activeFilters = {};

    selects.forEach(function (select) {
      var key = select.getAttribute("data-filter");
      if (key && select.value) {
        activeFilters[key] = select.value;
      }
    });

    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-search"));
      var matched = !query || haystack.indexOf(query) !== -1;
      Object.keys(activeFilters).forEach(function (key) {
        if (card.getAttribute("data-" + key) !== activeFilters[key]) {
          matched = false;
        }
      });
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  function setupFilters() {
    all(".section-block").forEach(function (section) {
      if (!section.querySelector(".filter-panel")) {
        return;
      }
      var input = section.querySelector(".filter-search");
      var selects = all(".filter-select", section);
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");

      if (input && query) {
        input.value = query;
      }

      if (input) {
        input.addEventListener("input", function () {
          applyFilters(section);
        });
      }

      selects.forEach(function (select) {
        select.addEventListener("change", function () {
          applyFilters(section);
        });
      });

      applyFilters(section);
    });
  }

  window.setupMoviePlayer = function (streamUrl) {
    var shell = document.querySelector(".movie-player");
    var video = document.getElementById("movie-video");
    var button = document.getElementById("play-button");
    var loaded = false;
    var hlsInstance = null;

    if (!shell || !video || !button || !streamUrl) {
      return;
    }

    function loadVideo() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      loadVideo();
      shell.classList.add("is-playing");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          shell.classList.remove("is-playing");
        });
      }
    }

    button.addEventListener("click", start);
    shell.addEventListener("click", function (event) {
      if (event.target === shell) {
        start();
      }
    });
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
})();
