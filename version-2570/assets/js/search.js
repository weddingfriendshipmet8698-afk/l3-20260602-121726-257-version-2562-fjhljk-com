(() => {
  const input = document.querySelector('[data-search-input]');
  const resultBox = document.querySelector('[data-search-results]');
  const title = document.querySelector('[data-search-title]');
  const data = Array.isArray(window.SEARCH_MOVIES) ? window.SEARCH_MOVIES : [];
  if (!input || !resultBox) return;

  const params = new URLSearchParams(window.location.search);
  const initial = params.get('q') || '';
  input.value = initial;

  const makeCard = (item) => {
    const tags = item.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
    return `<article class="movie-card">
      <a class="poster-link" href="${item.url}" aria-label="${escapeHtml(item.title)}">
        <span class="poster-wrap">
          <img src="${item.image}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.style.display='none'">
          <span class="poster-shade"></span>
          <span class="score-badge">${item.score}</span>
        </span>
      </a>
      <div class="card-body">
        <div class="card-meta"><a href="${item.categoryUrl}">${escapeHtml(item.category)}</a><span>${escapeHtml(item.year)}</span></div>
        <h3><a href="${item.url}">${escapeHtml(item.title)}</a></h3>
        <p>${escapeHtml(item.oneLine)}</p>
        <div class="tag-line">${tags}</div>
      </div>
    </article>`;
  };

  const search = (query) => {
    const q = query.trim().toLowerCase();
    const list = q ? data.filter((item) => {
      const haystack = [item.title, item.year, item.region, item.type, item.genre, item.category, item.oneLine, item.tags.join(' ')].join(' ').toLowerCase();
      return haystack.includes(q);
    }).slice(0, 80) : data.slice(0, 12);
    if (title) {
      title.textContent = q ? `“${query}”的搜索结果` : '热门推荐';
    }
    resultBox.innerHTML = list.map(makeCard).join('') || '<p class="empty-result">没有找到相关内容</p>';
  };

  const form = input.closest('form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const q = input.value.trim();
      const url = q ? `./search.html?q=${encodeURIComponent(q)}` : './search.html';
      history.replaceState(null, '', url);
      search(q);
    });
  }
  input.addEventListener('input', () => search(input.value));
  search(initial);

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[char]));
  }
})();
