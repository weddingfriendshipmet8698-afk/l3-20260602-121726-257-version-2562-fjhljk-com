(() => {
  const navButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (navButton && nav) {
    navButton.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('[data-go-slide]'));
  let currentSlide = 0;
  const showSlide = (index) => {
    if (!slides.length) return;
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  };
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.goSlide || 0));
    });
  });
  if (slides.length > 1) {
    setInterval(() => showSlide(currentSlide + 1), 5000);
  }

  document.querySelectorAll('[data-scroll-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.scrollTarget);
      if (!target) return;
      const dir = button.dataset.scrollDir === 'left' ? -1 : 1;
      target.scrollBy({ left: dir * 420, behavior: 'smooth' });
    });
  });

  const sortSelect = document.querySelector('[data-sort-list]');
  const viewSelect = document.querySelector('[data-view-list]');
  const sortGrid = document.getElementById(sortSelect ? sortSelect.dataset.sortList : '');
  const applySort = () => {
    if (!sortSelect || !sortGrid) return;
    const cells = Array.from(sortGrid.querySelectorAll('.sort-cell'));
    const mode = sortSelect.value;
    cells.sort((a, b) => {
      if (mode === 'title') {
        return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-CN');
      }
      const aValue = Number(a.dataset[mode] || 0);
      const bValue = Number(b.dataset[mode] || 0);
      return bValue - aValue;
    });
    cells.forEach((cell) => sortGrid.appendChild(cell));
  };
  if (sortSelect) {
    sortSelect.addEventListener('change', applySort);
  }
  if (viewSelect && sortGrid) {
    viewSelect.addEventListener('change', () => {
      sortGrid.classList.toggle('list-mode', viewSelect.value === 'list');
    });
  }
})();
