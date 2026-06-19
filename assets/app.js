document.addEventListener('DOMContentLoaded', function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('.main-nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  initHeroSlider();
  initSearchPage();
});

function initHeroSlider() {
  var hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  if (slides.length <= 1) {
    return;
  }

  function showSlide(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  window.setInterval(function () {
    showSlide(current + 1);
  }, 5200);
}

function initSearchPage() {
  var results = document.querySelector('[data-search-results]');
  var input = document.querySelector('[data-search-input]');
  var summary = document.querySelector('[data-search-summary]');
  var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]'));

  if (!results || !input || !summary) {
    return;
  }

  var cards = Array.prototype.slice.call(results.querySelectorAll('.movie-card'));
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  var initialCategory = params.get('cat') || 'all';

  input.value = initialQuery;

  var activeCategory = initialCategory;

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function updateButtons() {
    buttons.forEach(function (button) {
      button.classList.toggle('active', button.getAttribute('data-filter-category') === activeCategory);
    });
  }

  function filterCards() {
    var query = normalize(input.value);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category'),
        card.textContent
      ].join(' '));
      var category = card.getAttribute('data-category') || '';
      var queryMatched = !query || haystack.indexOf(query) !== -1;
      var categoryMatched = activeCategory === 'all' || category === activeCategory;
      var matched = queryMatched && categoryMatched;

      card.style.display = matched ? '' : 'none';

      if (matched) {
        visible += 1;
      }
    });

    summary.textContent = '当前显示 ' + visible + ' 部影片';
  }

  input.addEventListener('input', filterCards);

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeCategory = button.getAttribute('data-filter-category') || 'all';
      updateButtons();
      filterCards();
    });
  });

  updateButtons();
  filterCards();
}
