import { postCardHtml } from '../lib/postCard.mjs';

function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

// exact, then partial, then fuzzy (in-order subsequence) match
function titleMatches(title, query) {
  const t = normalize(title);
  const q = normalize(query);
  if (!q) return true;
  if (t === q) return true;
  if (t.includes(q)) return true;

  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

// required tags must all be present, excluded tags must all be absent
function tagsMatch(postTags, required, excluded) {
  for (const tag of required) {
    if (!postTags.includes(tag)) return false;
  }
  for (const tag of excluded) {
    if (postTags.includes(tag)) return false;
  }
  return true;
}

function sortPosts(posts, sort) {
  const arr = posts.slice();
  if (sort === 'oldest') {
    return arr.sort((a, b) => Date.parse(a.pubDate) - Date.parse(b.pubDate));
  }
  if (sort === 'latest-update') {
    return arr.sort(
      (a, b) => Date.parse(b.updatedDate ?? b.pubDate) - Date.parse(a.updatedDate ?? a.pubDate),
    );
  }
  return arr.sort((a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate));
}

function cardHtml(post) {
  return postCardHtml({
    ...post,
    isLegacy: post.tags.includes('legacy'),
    isRepost: post.tags.includes('repost'),
    full: true,
  });
}

function fallBackToStatic() {
  document.documentElement.classList.remove('js');
}

async function main() {
  const searchInput = document.getElementById('post-search-input');
  const sortButtons = document.querySelectorAll('#sort-buttons button[data-sort]');
  const sortButtonGroup = document.getElementById('sort-buttons');
  const randomButton = document.getElementById('random-post');
  const tagFilter = document.getElementById('tag-filter');
  const tagFilterChips = document.getElementById('tag-filter-chips');
  const authorFilter = document.getElementById('author-filter');
  const authorFilterChips = document.getElementById('author-filter-chips');
  const postList = document.getElementById('post-list');
  const pagination = document.getElementById('pagination');
  const prevButton = document.getElementById('prev-page');
  const nextButton = document.getElementById('next-page');
  const pageIndicator = document.getElementById('page-indicator');
  const status = document.getElementById('blog-status');

  if (
    !searchInput ||
    !sortButtonGroup ||
    !randomButton ||
    !tagFilter ||
    !tagFilterChips ||
    !authorFilter ||
    !authorFilterChips ||
    !postList ||
    !pagination ||
    !prevButton ||
    !nextButton ||
    !pageIndicator ||
    !status
  ) {
    fallBackToStatic();
    return;
  }

  status.hidden = false;
  sortButtonGroup.hidden = false;

  let allPosts = [];
  let pageSize = 6;

  const SORT_MODES = ['newest', 'oldest', 'latest-update'];
  const urlParams = new URLSearchParams(location.search);
  const pathParts = location.pathname.replace(/^\/blog\/?/, '').replace(/\/$/, '').split('/').filter(Boolean);
  const pathSort = SORT_MODES.includes(pathParts[0]) ? pathParts[0] : null;
  const pathPage = parseInt(pathParts[pathSort ? 1 : 0], 10);

  const state = {
    sort: SORT_MODES.includes(urlParams.get('sort')) ? urlParams.get('sort') : (pathSort ?? 'newest'),
    query: urlParams.get('q') ?? '',
    page: Math.max(1, parseInt(urlParams.get('page'), 10) || pathPage || 1),
  };

  const paramSet = (name) => new Set((urlParams.get(name) ?? '').split(',').filter(Boolean));

  const filters = [
    {
      param: 'tag',
      excludeParam: 'extag',
      details: tagFilter,
      chips: tagFilterChips,
      valuesOf: (post) => post.tags,
      required: paramSet('tag'),
      excluded: paramSet('extag'),
    },
    {
      param: 'author',
      excludeParam: 'exauthor',
      details: authorFilter,
      chips: authorFilterChips,
      valuesOf: (post) => (post.authors ?? []).map((author) => author.id),
      required: paramSet('author'),
      excluded: paramSet('exauthor'),
    },
  ];

  function syncUrl() {
    const params = new URLSearchParams();
    if (state.sort !== 'newest') params.set('sort', state.sort);
    if (state.page !== 1) params.set('page', String(state.page));
    if (state.query) params.set('q', state.query);
    for (const filter of filters) {
      if (filter.required.size > 0) params.set(filter.param, [...filter.required].join(','));
      if (filter.excluded.size > 0) params.set(filter.excludeParam, [...filter.excluded].join(','));
    }
    const qs = params.toString();
    history.replaceState(null, '', qs ? `/blog/?${qs}` : '/blog/');
  }

  function currentList() {
    const sorted = sortPosts(allPosts, state.sort);
    return sorted.filter(
      (post) =>
        titleMatches(post.title, state.query) &&
        filters.every((filter) => tagsMatch(filter.valuesOf(post), filter.required, filter.excluded)),
    );
  }

  function buildChips(filter, options) {
    if (options.length === 0) return;
    filter.details.hidden = false;
    for (const { value, label } of options) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'tag-chip';
      chip.textContent = label;
      chip.dataset.value = value;
      chip.dataset.state = filter.required.has(value) ? 'include' : filter.excluded.has(value) ? 'exclude' : 'neutral';
      chip.setAttribute('aria-pressed', String(chip.dataset.state !== 'neutral'));
      filter.chips.append(chip);
    }
    filter.details.open = filter.required.size > 0 || filter.excluded.size > 0;
  }

  function render() {
    const list = currentList();
    const lastPage = Math.max(1, Math.ceil(list.length / pageSize));
    state.page = Math.min(state.page, lastPage);

    const start = (state.page - 1) * pageSize;
    const pageItems = list.slice(start, start + pageSize);

    postList.innerHTML = pageItems.map(cardHtml).join('');
    postList.removeAttribute('data-static');

    const filtering = state.query || filters.some((filter) => filter.required.size > 0 || filter.excluded.size > 0);
    if (list.length === 0) {
      status.textContent = filtering ? 'No posts match this filter.' : 'No posts yet.';
    } else {
      status.textContent = filtering ? `${list.length} post${list.length === 1 ? '' : 's'} match.` : '';
    }

    pagination.hidden = lastPage <= 1;
    pageIndicator.textContent = `Page ${state.page} of ${lastPage}`;
    prevButton.disabled = state.page <= 1;
    nextButton.disabled = state.page >= lastPage;
    randomButton.disabled = list.length === 0;

    for (const button of sortButtons) {
      button.setAttribute('aria-current', button.dataset.sort === state.sort ? 'page' : 'false');
    }

    syncUrl();
  }

  try {
    const response = await fetch('/blog-data.json');
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    const data = await response.json();
    allPosts = data.posts ?? [];
    pageSize = data.pageSize ?? pageSize;

    buildChips(filters[0], (data.tags ?? []).map((tag) => ({ value: tag, label: tag })));
    buildChips(filters[1], (data.authors ?? []).map((author) => ({ value: author.id, label: author.name })));
  } catch {
    status.textContent = 'Could not load search and sorting, showing the plain list instead.';
    sortButtonGroup.hidden = true;
    fallBackToStatic();
    return;
  }

  searchInput.value = state.query;
  searchInput.disabled = false;
  for (const button of sortButtons) button.disabled = false;

  searchInput.addEventListener('input', () => {
    state.query = searchInput.value.trim();
    state.page = 1;
    render();
  });

  for (const button of sortButtons) {
    button.addEventListener('click', () => {
      state.sort = button.dataset.sort;
      state.page = 1;
      render();
    });
  }

  // each chip cycles neutral -> require -> exclude -> neutral
  for (const filter of filters) {
    filter.chips.addEventListener('click', (event) => {
      const chip = event.target.closest('.tag-chip');
      if (!chip) return;

      const value = chip.dataset.value;
      const next = { neutral: 'include', include: 'exclude', exclude: 'neutral' }[chip.dataset.state];

      chip.dataset.state = next;
      chip.setAttribute('aria-pressed', String(next !== 'neutral'));
      filter.required.delete(value);
      filter.excluded.delete(value);
      if (next === 'include') filter.required.add(value);
      if (next === 'exclude') filter.excluded.add(value);

      state.page = 1;
      render();
    });
  }

  randomButton.addEventListener('click', () => {
    const list = currentList();
    if (list.length === 0) return;
    const post = list[Math.floor(Math.random() * list.length)];
    location.href = `/blog/${post.slug}/`;
  });

  prevButton.addEventListener('click', () => {
    state.page = Math.max(1, state.page - 1);
    render();
  });

  nextButton.addEventListener('click', () => {
    state.page += 1;
    render();
  });

  render();
}

main();
