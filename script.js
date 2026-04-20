(function () {
  const entities = Array.isArray(window.GDER_ENTITIES) ? window.GDER_ENTITIES : [];

  const statEntities = document.querySelector('[data-stat-entities]');
  const statJurisdictions = document.querySelector('[data-stat-jurisdictions]');
  const statWrappers = document.querySelector('[data-stat-wrappers]');
  const featuredCards = document.querySelector('[data-featured-cards]');
  const searchInput = document.querySelector('[data-entity-search]');
  const typeFilter = document.querySelector('[data-entity-type-filter]');
  const entityGrid = document.querySelector('[data-entity-grid]');
  const browserResults = document.querySelector('[data-browser-results]');
  const entityEmpty = document.querySelector('[data-entity-empty]');

  if (!featuredCards || !searchInput || !typeFilter || !entityGrid || !browserResults || !entityEmpty) {
    return;
  }

  const sortedEntities = [...entities].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  const unique = (key) => [...new Set(sortedEntities.map((entity) => entity[key]).filter(Boolean))];
  const jurisdictions = unique('jurisdiction');
  const wrapperTypes = unique('legalWrapperType');
  const entityTypes = unique('entityType').sort();

  if (statEntities) statEntities.textContent = String(sortedEntities.length);
  if (statJurisdictions) statJurisdictions.textContent = String(jurisdictions.length);
  if (statWrappers) statWrappers.textContent = String(wrapperTypes.length);

  for (const entityType of entityTypes) {
    const option = document.createElement('option');
    option.value = entityType;
    option.textContent = entityType;
    typeFilter.appendChild(option);
  }

  const featuredIds = [
    'dao-arbitrum-foundation',
    'dao-ens-foundation-limited',
    'dao-uniswap-foundation',
  ];

  const featured = featuredIds
    .map((id) => sortedEntities.find((entity) => entity.id === id))
    .filter(Boolean);

  const laneFeatured = featured.length ? featured : sortedEntities.slice(0, 3);

  function truncate(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trim()}…`;
  }

  function makeCardLabel(text, className) {
    const node = document.createElement('span');
    node.className = className;
    node.textContent = text;
    return node;
  }

  function makePill(value, className) {
    const pill = document.createElement('span');
    pill.className = className;
    pill.textContent = value;
    return pill;
  }

  function renderFeaturedCards(items) {
    featuredCards.innerHTML = '';

    for (const entity of items.slice(0, 3)) {
      const card = document.createElement('article');
      card.className = 'feature-card';

      const head = document.createElement('div');
      head.className = 'feature-card-head';
      head.appendChild(makeCardLabel('Research set', 'feature-card-label'));

      const link = document.createElement('a');
      link.className = 'feature-card-link';
      link.href = entity.canonicalUrl;
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.textContent = 'Official source ↗';
      head.appendChild(link);

      const title = document.createElement('h3');
      title.textContent = entity.name;

      const pills = document.createElement('div');
      pills.className = 'feature-card-pills';
      pills.appendChild(makePill('Research set', 'card-pill'));
      if (entity.legalWrapperType) pills.appendChild(makePill(entity.legalWrapperType, 'card-pill'));
      if (entity.jurisdiction) pills.appendChild(makePill(entity.jurisdiction, 'card-pill'));

      const summary = document.createElement('p');
      summary.textContent = truncate(entity.basis, 170);

      card.appendChild(head);
      card.appendChild(title);
      card.appendChild(pills);
      card.appendChild(summary);
      featuredCards.appendChild(card);
    }
  }

  function matches(entity, searchTerm, selectedType) {
    const haystack = [
      entity.name,
      entity.legalName,
      entity.entityType,
      entity.legalWrapperType,
      entity.jurisdiction,
      entity.formationCountry,
      entity.basis,
      entity.governanceAnchorType,
      entity.confidenceTier,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const searchOk = !searchTerm || haystack.includes(searchTerm);
    const typeOk = !selectedType || entity.entityType === selectedType;
    return searchOk && typeOk;
  }

  function renderGrid(items) {
    entityGrid.innerHTML = '';
    browserResults.textContent = `${items.length} ${items.length === 1 ? 'entity' : 'entities'}`;
    entityEmpty.hidden = items.length > 0;

    for (const entity of items) {
      const card = document.createElement('a');
      card.className = 'entity-card';
      card.href = entity.canonicalUrl;
      card.target = '_blank';
      card.rel = 'noreferrer';

      const head = document.createElement('div');
      head.className = 'entity-card-head';

      const left = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = entity.name;
      left.appendChild(title);

      if (entity.legalName && entity.legalName !== entity.name) {
        const legal = document.createElement('p');
        legal.className = 'entity-legal';
        legal.textContent = entity.legalName;
        left.appendChild(legal);
      }

      const source = document.createElement('span');
      source.className = 'entity-source';
      source.textContent = 'Official source ↗';

      head.appendChild(left);
      head.appendChild(source);

      const pills = document.createElement('div');
      pills.className = 'entity-card-pills';
      pills.appendChild(makePill('Research set', 'entity-pill'));
      if (entity.entityType) pills.appendChild(makePill(entity.entityType, 'entity-pill'));
      if (entity.legalWrapperType) pills.appendChild(makePill(entity.legalWrapperType, 'entity-pill'));
      if (entity.jurisdiction) pills.appendChild(makePill(entity.jurisdiction, 'entity-pill'));

      const basis = document.createElement('p');
      basis.className = 'entity-basis';
      basis.textContent = truncate(entity.basis, 170);

      card.appendChild(head);
      card.appendChild(pills);
      card.appendChild(basis);
      entityGrid.appendChild(card);
    }
  }

  function updateGrid() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedType = typeFilter.value;
    const filtered = sortedEntities.filter((entity) => matches(entity, searchTerm, selectedType));
    renderGrid(filtered);
  }

  renderFeaturedCards(laneFeatured);
  renderGrid(sortedEntities);

  searchInput.addEventListener('input', updateGrid);
  typeFilter.addEventListener('change', updateGrid);
})();
