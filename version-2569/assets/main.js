document.addEventListener("DOMContentLoaded", function () {
  var navToggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-site-nav]");

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function setSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        setSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        setSlide(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    setSlide(0);
    start();
  });

  document.querySelectorAll("[data-search-panel]").forEach(function (panel) {
    var form = panel.querySelector("[data-search-form]");
    var input = panel.querySelector("[data-search-input]");
    var empty = panel.querySelector("[data-search-empty]");
    var scope = panel.closest("main") || document;
    var cards = Array.from(scope.querySelectorAll("[data-card]"));
    var activeFilter = "";

    function applySearch() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = card.getAttribute("data-search") || "";
        var tags = card.getAttribute("data-tags") || "";
        var matchedQuery = !query || searchText.indexOf(query) !== -1 || tags.indexOf(query) !== -1;
        var matchedFilter = !activeFilter || tags.indexOf(activeFilter.toLowerCase()) !== -1;
        var show = matchedQuery && matchedFilter;
        card.classList.toggle("is-hidden-by-search", !show);

        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", cards.length > 0 && visible === 0);
      }
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        applySearch();
      });
    }

    if (input) {
      input.addEventListener("input", applySearch);
    }

    panel.querySelectorAll("[data-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter") || "";
        panel.querySelectorAll("[data-filter]").forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applySearch();
      });
    });
  });

  var player = document.querySelector("[data-player]");
  if (player) {
    var video = player.querySelector("video");
    var overlay = player.querySelector("[data-player-overlay]");
    var sourceElement = document.getElementById("play-source");
    var sourceUrl = "";
    var hlsInstance = null;
    var prepared = false;

    try {
      sourceUrl = JSON.parse(sourceElement.textContent).src || "";
    } catch (error) {
      sourceUrl = "";
    }

    function prepareVideo() {
      if (!video || !sourceUrl || prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function playVideo() {
      prepareVideo();

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      if (video) {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
});
